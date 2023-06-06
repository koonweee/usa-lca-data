'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from "react-chartjs-2";
import {lca_disclosures} from ".prisma/client";

interface JobCategoryBreakdownProps {
    lca_disclosures: lca_disclosures[];
}

const JobCategoryBreakdown = (props: JobCategoryBreakdownProps) => {
    console.log(props)

    ChartJS.register(ArcElement, Tooltip, Legend);

    const socTitleCount = new Map();

    props.lca_disclosures.map((lca_disclosure) => {
        if (!lca_disclosure.socTitle) {
            return;
        }

        if (socTitleCount.has(lca_disclosure.socTitle)) {
            socTitleCount.set(lca_disclosure.socTitle, socTitleCount.get(lca_disclosure.socTitle) + 1);
        } else {
            socTitleCount.set(lca_disclosure.socTitle, 1);
        }
    });

    const labels = Array.from(socTitleCount.keys());
    const data = Array.from(socTitleCount.values());

    const pieData = {
        labels: labels,
        datasets: [
            {
                label: '# of Votes',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="w-1/2 mx-auto flex justify-center">
            <Pie data={pieData} />
        </div>
    );
}

export default JobCategoryBreakdown;