import { useApp } from '../context/AppContext';

export function usePlans() {
  const { plans, addPlan, updatePlan, deletePlan } = useApp();

  const getPlansForStock = (code) => plans[code] || [];

  const getAllPlans = () => {
    const all = [];
    for (const [code, stockPlans] of Object.entries(plans)) {
      for (const plan of stockPlans) {
        all.push({ ...plan, code });
      }
    }
    all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return all;
  };

  return { plans, addPlan, updatePlan, deletePlan, getPlansForStock, getAllPlans };
}
