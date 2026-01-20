import React from 'react';
import { CATEGORIES } from '../../utils/constants';

const DatasetSelector = ({ datasets, value, onChange, disabled }) => (
    <div className="select-wrapper">
        <select value={value} onChange={onChange} disabled={disabled}>
            <option value="">
                {disabled ? 'Loading datasets...' : 'Select a dataset...'}
            </option>
            {CATEGORIES.map(category => {
                const categoryDatasets = datasets.filter(d => d.category === category);
                if (categoryDatasets.length === 0) return null;

                return (
                    <optgroup key={category} label={category.toUpperCase()}>
                        {categoryDatasets.map(ds => (
                            <option key={ds.value} value={ds.value}>
                                {ds.label}
                            </option>
                        ))}
                    </optgroup>
                );
            })}
        </select>
    </div>
);

export default DatasetSelector;
