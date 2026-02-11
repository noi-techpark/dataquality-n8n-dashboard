// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import React from 'react';
import {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { CHART_COLORS, STATUS_COLORS } from '../../utils/constants';

const ChartsGrid = ({ data }) => (
    <div className="charts-grid">
        {/* Top Missing Fields */}
        <div className="chart-container">
            <h3>Top Fields with Missing Data</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={(data?.fieldCompleteness || []).slice(0, 10)} layout="vertical" barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 12 }} interval={0} />
                    <Tooltip />
                    <Bar dataKey="missing" fill={STATUS_COLORS.danger} radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>

        {/* Data Type Distribution */}
        <div className="chart-container">
            <h3>Data Type Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data.dataTypeDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                    >
                        {data.dataTypeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>

        {/* Completeness Distribution */}
        <div className="chart-container">
            <h3>Field Completeness Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.completenessDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={STATUS_COLORS.success} radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>

        {/* Quality Radar */}
        <div className="chart-container">
            <h3>Quality Dimensions</h3>
            <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={data.qualityScores}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                        name="Score"
                        dataKey="score"
                        stroke={STATUS_COLORS.primary}
                        fill={STATUS_COLORS.primary}
                        fillOpacity={0.6}
                    />
                    <Tooltip />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export default ChartsGrid;

