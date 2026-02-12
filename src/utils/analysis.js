// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Utility for handling progressive data analysis. 
 * Automatically adapts to different API structures and calculates quality scores.
 */

export const generateEmptyReport = () => ({
    kpis: {
        qualityScore: 0,
        totalRecords: 0,
        totalFields: 0,
        completenessScore: 0,
        consistencyScore: 0,
        uniquenessScore: 0,
        validityScore: 0,
        criticalFields: 0
    },
    fieldCompleteness: [],
    qualityScores: [
        { dimension: 'Completeness', score: 0 },
        { dimension: 'Consistency', score: 0 },
        { dimension: 'Uniqueness', score: 0 },
        { dimension: 'Validity', score: 0 }
    ],
    dataTypeDistribution: [],
    completenessDistribution: [
        { range: '0-20%', count: 0 },
        { range: '21-40%', count: 0 },
        { range: '41-60%', count: 0 },
        { range: '61-80%', count: 0 },
        { range: '81-100%', count: 0 }
    ]
});

/**
 * Searches for records in an API response.
 * Looks for common keys like 'data' or 'items', then falls back to searching 
 * for any field that contains an array of objects.
 */
export function extractRecordsFromResponse(data) {
    if (Array.isArray(data)) {
        return data;
    }
    if (!data || typeof data !== 'object') {
        return [];
    }
    const commonFields = [
        'Items', 'items', 'data', 'Data', 'results', 'Results',
        'records', 'Records', 'list', 'List', 'rows', 'Rows',
        'entries', 'Entries', 'content', 'Content', 'values', 'Values'
    ];

    // Check standard record keys first
    for (const field of commonFields) {
        if (data[field] && Array.isArray(data[field])) {
            return data[field];
        }
    }

    // Scan for any field containing an array of records
    for (const value of Object.values(data)) {
        if (Array.isArray(value) && value.length > 0) {
            if (typeof value[0] === 'object' && value[0] !== null) {
                return value;
            }
        }
    }

    // Handle cases where the object is the record itself
    return [data];
}

/**
 * Scans for pagination metadata (total, limit, offset) in the response object.
 */
export function extractPaginationInfo(data, recordsFound) {
    const result = {
        totalResults: recordsFound.length,
        totalPages: 1,
        currentPage: 1,
        pageSize: recordsFound.length
    };

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return result;
    }

    const totalFields = ['TotalResults', 'totalResults', 'total_count', 'total', 'count'];
    for (const field of totalFields) {
        if (data[field] !== undefined && data[field] !== null) {
            result.totalResults = parseInt(data[field]);
            break;
        }
    }

    const pageSizeFields = ['PageSize', 'pageSize', 'limit', 'size'];
    for (const field of pageSizeFields) {
        if (data[field] !== undefined && data[field] !== null) {
            result.pageSize = parseInt(data[field]);
            break;
        }
    }

    if (result.totalPages === 1 && result.totalResults > result.pageSize && result.pageSize > 0) {
        result.totalPages = Math.ceil(result.totalResults / result.pageSize);
    }

    return result;
}

/**
 * Flattens nested objects into dot-notation keys for easier analysis.
 */
export function flattenObject(obj, prefix = '') {
    const result = {};
    if (!obj || typeof obj !== 'object') return result;

    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (value === null || value === undefined) {
            result[newKey] = null;
        } else if (Array.isArray(value)) {
            result[newKey] = value;
        } else if (typeof value === 'object') {
            Object.assign(result, flattenObject(value, newKey));
        } else {
            result[newKey] = value;
        }
    }
    return result;
}

/**
 * Initializes the internal state used to track metrics across multiple data chunks.
 */
export const createAnalysisState = () => ({
    totalRecords: 0,
    fieldStats: {},
    uniqueKeys: new Set(),
    startTime: Date.now()
});

/**
 * Processes a batch of records and updates the analysis state.
 * Supports streaming so the UI can update progressively.
 */
export const processChunk = (state, records) => {
    if (!records || !records.length) return state;

    for (const record of records) {
        state.totalRecords++;
        const flattened = flattenObject(record);

        // Track uniqueness to calculate the duplicate ratio
        const recordStr = JSON.stringify(flattened);
        if (!state.uniqueKeys.has(recordStr) && state.uniqueKeys.size < 50000) {
            state.uniqueKeys.add(recordStr);
        }

        for (const [field, v] of Object.entries(flattened)) {
            if (!state.fieldStats[field]) {
                state.fieldStats[field] = { present: 0, missing: 0, types: {} };
            }
            const stats = state.fieldStats[field];

            // Evaluate if the value is missing or present
            if (v === null || v === undefined || (typeof v === 'string' && v.trim() === '')) {
                stats.missing++;
            } else {
                stats.present++;
                const type = Array.isArray(v) ? 'array' : typeof v;
                stats.types[type] = (stats.types[type] || 0) + 1;
            }
        }
    }
    return state;
};

/**
 * Aggregates the collected stats into a final report with weighted scoring.
 * Dimensions: Completeness (40%), Consistency (30%), Uniqueness (20%), Validity (10%).
 */
export const generateFinalReport = (state) => {
    const { totalRecords, fieldStats, uniqueKeys } = state;
    const allFields = Object.keys(fieldStats);

    if (totalRecords === 0) return generateEmptyReport();

    // Calculate metrics for each individual field
    const fieldCompleteness = allFields.map(field => {
        const s = fieldStats[field];
        const presentPercentage = Number(((s.present / totalRecords) * 100).toFixed(2));
        const missingPercentage = Number((100 - presentPercentage).toFixed(2));

        // Determine the dominant data type for consistency checking
        const types = Object.entries(s.types).sort((a, b) => b[1] - a[1]);
        const dominantType = types.length > 0 ? types[0][0] : 'unknown';
        const dominantCount = types.length > 0 ? types[0][1] : 0;
        const consistencyPercentage = s.present > 0 ? Number(((dominantCount / s.present) * 100).toFixed(2)) : 100;

        return {
            name: field,
            completeness: presentPercentage,
            missing: missingPercentage,
            dataType: dominantType,
            consistency: consistencyPercentage,
            isConsistent: Object.keys(s.types).length <= 1,
            presentCount: s.present,
            missingCount: s.missing
        };
    }).sort((a, b) => b.missing - a.missing);

    // Calculate overall dashboard KPIs
    const totalCells = totalRecords * allFields.length;
    const totalPresentCount = Object.values(fieldStats).reduce((sum, s) => sum + s.present, 0);
    const overallCompleteness = Number((totalPresentCount / totalCells * 100).toFixed(2));

    const consistentFieldsCount = fieldCompleteness.filter(f => f.isConsistent).length;
    const overallConsistency = Number((consistentFieldsCount / allFields.length * 100).toFixed(2));

    const uniquenessScore = Number(((uniqueKeys.size / totalRecords) * 100).toFixed(2));

    // Final Quality Score based on weighted metrics
    const overallQualityScore = Number((
        overallCompleteness * 0.4 +
        overallConsistency * 0.4 +
        uniquenessScore * 0.2
    ).toFixed(2));

    const criticalFieldsCount = fieldCompleteness.filter(f => f.completeness < 50).length;

    // Build distributions for charts
    const typeCountMap = {};
    const bucketCounts = [0, 0, 0, 0, 0];

    for (const f of fieldCompleteness) {
        typeCountMap[f.dataType] = (typeCountMap[f.dataType] || 0) + 1;
        const pct = f.completeness;
        if (pct <= 20) bucketCounts[0]++;
        else if (pct <= 40) bucketCounts[1]++;
        else if (pct <= 60) bucketCounts[2]++;
        else if (pct <= 80) bucketCounts[3]++;
        else bucketCounts[4]++;
    }

    return {
        kpis: {
            qualityScore: overallQualityScore,
            totalRecords,
            totalFields: allFields.length,
            completenessScore: overallCompleteness,
            consistencyScore: overallConsistency,
            uniquenessScore,
            validityScore: overallConsistency,
            criticalFields: criticalFieldsCount
        },
        fieldCompleteness,
        qualityScores: [
            { dimension: 'Completeness', score: overallCompleteness },
            { dimension: 'Consistency', score: overallConsistency },
            { dimension: 'Uniqueness', score: uniquenessScore },
            { dimension: 'Validity', score: overallConsistency }
        ],
        dataTypeDistribution: Object.entries(typeCountMap).map(([name, value]) => ({ name, value })),
        completenessDistribution: [
            { range: '0-20%', count: bucketCounts[0] },
            { range: '21-40%', count: bucketCounts[1] },
            { range: '41-60%', count: bucketCounts[2] },
            { range: '61-80%', count: bucketCounts[3] },
            { range: '81-100%', count: bucketCounts[4] }
        ]
    };
};