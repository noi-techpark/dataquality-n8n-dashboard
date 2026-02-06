/**
 * Utility for progressive data analysis.
 * Processes data in chunks to keep memory usage low.
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
 * Flattens a nested object into a single-level object with dot-notated keys.
 */
export const flattenObject = (obj, prefix = '') => {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(result, flattenObject(value, newKey));
        } else {
            result[newKey] = value;
        }
    }
    return result;
};

/**
 * Creates an empty analysis state object.
 */
export const createAnalysisState = () => ({
    totalRecords: 0,
    fieldStats: {},
    // Use a simple uniqueness estimation instead of storing all records
    uniqueHashes: new Set(),
    startTime: Date.now()
});

/**
 * Processes a chunk of records and updates the analysis state.
 */
export const processChunk = (state, records) => {
    if (!records || !records.length) return state;

    state.totalRecords += records.length;

    for (const record of records) {
        const flattened = flattenObject(record);

        for (const [field, value] of Object.entries(flattened)) {
            if (!state.fieldStats[field]) {
                state.fieldStats[field] = { present: 0, missing: 0, types: {} };
            }

            if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
                state.fieldStats[field].missing++;
            } else {
                state.fieldStats[field].present++;

                const type = Array.isArray(value) ? 'array' : typeof value;
                state.fieldStats[field].types[type] = (state.fieldStats[field].types[type] || 0) + 1;
            }
        }

        // Uniqueness Estimation (Memory efficient: using a string hash)
        // We cap this to avoid infinite growth if datasets are truly massive
        if (state.uniqueHashes.size < 50000) {
            state.uniqueHashes.add(JSON.stringify(flattened));
        }
    }

    return state;
};

/**
 * Calculates final KPIs and distributions from the accumulated state.
 */
export const generateFinalReport = (state) => {
    const { totalRecords, fieldStats, uniqueHashes } = state;
    const allFields = Object.keys(fieldStats);

    if (totalRecords === 0) return null;

    // 1. Calculate Field Completeness
    const fieldCompleteness = allFields.map(field => {
        const s = fieldStats[field];
        const presentPercentage = (s.present / totalRecords) * 100;

        const sortedTypes = Object.entries(s.types).sort((a, b) => b[1] - a[1]);
        const dominantType = sortedTypes.length > 0 ? sortedTypes[0][0] : 'unknown';

        return {
            name: field,
            completeness: Number(presentPercentage.toFixed(2)),
            missing: Number((100 - presentPercentage).toFixed(2)),
            dataType: dominantType,
            presentCount: s.present,
            missingCount: s.missing
        };
    }).sort((a, b) => b.missing - a.missing);

    // 2. Aggregate Overall KPIs
    const totalCells = totalRecords * allFields.length;
    const totalPresentCount = Object.values(fieldStats).reduce((sum, s) => sum + s.present, 0);
    const overallCompleteness = Number((totalPresentCount / totalCells * 100).toFixed(2));

    let consistentFieldsCount = 0;
    for (const field of allFields) {
        if (Object.keys(fieldStats[field].types).length <= 1) consistentFieldsCount++;
    }
    const overallConsistency = Number((consistentFieldsCount / allFields.length * 100).toFixed(2));

    const uniquenessScore = Number(((uniqueHashes.size / totalRecords) * 100).toFixed(2));
    const criticalFieldsCount = fieldCompleteness.filter(f => f.completeness < 50).length;

    const overallQualityScore = Number((
        overallCompleteness * 0.4 +
        overallConsistency * 0.3 +
        uniquenessScore * 0.2 +
        overallConsistency * 0.1
    ).toFixed(2));

    // 3. Distributions for Charts
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
