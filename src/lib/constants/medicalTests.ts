export const MEDICAL_TESTS = {
    Hematology: [
        {
            name: "Complete Blood Count (CBC)",
            parameters: [
                { name: "Hemoglobin", unit: "g/dL", range: "13.0-17.0" },
                { name: "WBC Count", unit: "/cumm", range: "4000-11000" },
                { name: "RBC Count", unit: "million/cumm", range: "4.5-5.5" },
                { name: "Platelet Count", unit: "lakh/cumm", range: "1.5-4.5" },
                { name: "Hematocrit (PCV)", unit: "%", range: "40-50" },
            ]
        },
        {
            name: "Blood Sugar",
            parameters: [
                { name: "Fasting Blood Sugar", unit: "mg/dL", range: "70-100" },
                { name: "Post-Prandial Blood Sugar", unit: "mg/dL", range: "70-140" },
                { name: "HbA1c", unit: "%", range: "< 5.7" }
            ]
        }
    ],
    Biochemistry: [
        {
            name: "Lipid Profile",
            parameters: [
                { name: "Total Cholesterol", unit: "mg/dL", range: "< 200" },
                { name: "HDL Cholesterol", unit: "mg/dL", range: "> 40" },
                { name: "LDL Cholesterol", unit: "mg/dL", range: "< 100" },
                { name: "Triglycerides", unit: "mg/dL", range: "< 150" }
            ]
        },
        {
            name: "Liver Function Test (LFT)",
            parameters: [
                { name: "Bilirubin (Total)", unit: "mg/dL", range: "0.1-1.2" },
                { name: "SGOT (AST)", unit: "U/L", range: "0-35" },
                { name: "SGPT (ALT)", unit: "U/L", range: "0-45" },
                { name: "Alkaline Phosphatase", unit: "U/L", range: "30-120" }
            ]
        },
        {
            name: "Kidney Function Test (KFT)",
            parameters: [
                { name: "Blood Urea", unit: "mg/dL", range: "13-43" },
                { name: "Serum Creatinine", unit: "mg/dL", range: "0.7-1.3" },
                { name: "Uric Acid", unit: "mg/dL", range: "3.5-7.2" }
            ]
        },
        {
            name: "Thyroid Profile",
            parameters: [
                { name: "T3", unit: "ng/mL", range: "0.8-2.0" },
                { name: "T4", unit: "µg/dL", range: "5.1-14.1" },
                { name: "TSH", unit: "µIU/mL", range: "0.27-4.2" }
            ]
        }
    ],
    "Urine Analysis": [
        {
            name: "Urine Routine",
            parameters: [
                { name: "Color", unit: "", range: "Pale Yellow" },
                { name: "pH", unit: "", range: "4.5-8.0" },
                { name: "Specific Gravity", unit: "", range: "1.005-1.025" },
                { name: "Protein", unit: "", range: "Negative" },
                { name: "Sugar", unit: "", range: "Negative" }
            ]
        }
    ],
    "Vitamins": [
        {
            name: "Vitamin Profile",
            parameters: [
                { name: "Vitamin D (Total)", unit: "ng/mL", range: "30-100" },
                { name: "Vitamin B12", unit: "pg/mL", range: "197-771" }
            ]
        }
    ]
};
