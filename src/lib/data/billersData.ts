import categorySummary from '../../biller_categories/_summary.json';

type BillerItem = {
  "Biller Name"?: string;
  State?: string;
  Billers?: string;
};

type CategorySummaryItem = {
  category: string;
  count: number;
  file: string;
};

const categoryJsonModules = import.meta.glob('../../biller_categories/*.json', {
  eager: true,
}) as Record<string, { default: unknown }>;

export const missingCategoryFiles = new Set<string>();

export const billersByCategory = (categorySummary as CategorySummaryItem[]).reduce<Record<string, BillerItem[]>>((acc, entry) => {
  const fileName = entry.file.split('/').pop();
  if (!fileName) {
    missingCategoryFiles.add(entry.category);
    acc[entry.category] = [];
    return acc;
  }

  const moduleKey = `../../biller_categories/${fileName}`;
  const categoryModule = categoryJsonModules[moduleKey];
  const records = categoryModule?.default;

  if (!categoryModule || !Array.isArray(records)) {
    missingCategoryFiles.add(entry.category);
  }

  acc[entry.category] = Array.isArray(records) ? (records as BillerItem[]) : [];
  return acc;
}, {});
