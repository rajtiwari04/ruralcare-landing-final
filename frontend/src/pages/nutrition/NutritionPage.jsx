import React, { useState, useEffect } from "react";
import { nutritionAPI } from "../../services/index";
import { useAuth } from "../../context/AuthContext";
import {
  Leaf, Sparkles, Plus, Calendar, Clock, RefreshCw,
  CheckCircle2, AlertCircle, Heart, Utensils, Activity,
  Printer, ChevronDown, ChevronUp, Loader2, BookOpen
} from "lucide-react";

const CONDITIONS = [
  { id: "General Health & Vitality", label: "General Health & Immunity", desc: "Balanced diet using seasonal regional produce" },
  { id: "Nutritional Anemia & Iron Deficiency", label: "Anemia & Low Hemoglobin", desc: "Iron & Vitamin C rich local foods" },
  { id: "Type 2 Diabetes & Sugar Management", label: "Type 2 Diabetes", desc: "Low glycemic index, millets, high fiber" },
  { id: "Hypertension & Heart Health", label: "Hypertension (High BP)", desc: "Low sodium, potassium rich vegetables" },
  { id: "Maternal & Lactation Nutrition", label: "Maternal & Pregnancy Diet", desc: "High calcium, folic acid, extra calories" },
  { id: "Child Growth & Underweight", label: "Child Growth & Underweight", desc: "High protein, energy dense lentils and dairy" },
];

const REGIONS = [
  { id: "Uttar Pradesh & Purvanchal", label: "Uttar Pradesh / Purvanchal" },
  { id: "Bihar & Mithila", label: "Bihar & Mithila Region" },
  { id: "Madhya Pradesh & Bundelkhand", label: "Madhya Pradesh / Bundelkhand" },
  { id: "West Bengal & Eastern India", label: "West Bengal & Eastern India" },
  { id: "Maharashtra & Deccan", label: "Maharashtra & Central India" },
  { id: "South India (Tamil Nadu/AP)", label: "South India" },
];

const DEFAULT_PLAN = `### 🥗 7-Day Regional Nutrition Plan (RuralCare AI)

**Day 1 - 3 (Energy & Iron Focus):**
* **Morning (8:00 AM):** 1 glass warm lemon water + handful of soaked roasted chana (gram) & small piece of jaggery (gud).
* **Breakfast (9:00 AM):** 2 Bajra or Wheat rotis with spiced Palak (spinach) or seasonal saag, 1 bowl homemade curd (dahi).
* **Mid-Day (12:00 PM):** 1 glass roasted Sattu drink with pinch of cumin and rock salt.
* **Lunch (1:30 PM):** 1 cup brown rice or 2 rotis + 1 big bowl Arhar (toor) or Moong dal + seasonal green sabzi + lemon wedge.
* **Evening (5:00 PM):** Roasted makhana (foxnuts) or roasted peanuts + warm spiced tea without excess sugar.
* **Dinner (8:00 PM):** 2 multigrain rotis + Lauki (bottle gourd) or Turai sabzi + 1 bowl light Moong dal.

**Day 4 - 7 (Digestive & Cardiovascular Balance):**
* **Morning:** Warm water with tulsi & ginger infusion.
* **Breakfast:** Besan/Moong dal chilla with chopped onions, tomatoes, and mint chutney.
* **Lunch:** Dalia khichdi loaded with carrots, peas, and leafy greens + 1 spoon pure mustard oil/ghee.
* **Evening:** Seasonal local fruit (Guava, Papaya, Orange or Ber) - rich in Vitamin C.
* **Dinner:** 2 whole wheat rotis + Methi-Aloo or Baingan bharta + buttermilk (chaas).

---
### 🏃‍♂️ Simple Daily Physical Activity Plan
* **Brisk Walking:** 30 minutes daily morning or post-dinner stroll around village fields.
* **Gentle Joint Mobility:** 10 minutes of arm circles, neck rotations, and deep breathing (Pranayama).
* **Hydration:** Ensure minimum 2.5 to 3 Litres of clean, boiled water throughout the day.`;

export default function NutritionPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState("General Health & Vitality");
  const [selectedRegion, setSelectedRegion] = useState("Uttar Pradesh & Purvanchal");
  const [currentPlan, setCurrentPlan] = useState("");

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await nutritionAPI.getPlans();
      const apiPlans = res.data?.data?.plans;
      if (Array.isArray(apiPlans) && apiPlans.length > 0) {
        setPlans(apiPlans);
        if (apiPlans[0]?.mealPlan) {
          setCurrentPlan(apiPlans[0].mealPlan);
        }
      } else {
        setPlans([]);
        setCurrentPlan("");
      }
    } catch {
      setPlans([]);
      setCurrentPlan("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await nutritionAPI.generatePlan({
        condition: selectedCondition,
        region: selectedRegion,
      });
      const generated = res.data?.data?.plan;
      if (generated?.mealPlan) {
        setCurrentPlan(generated.mealPlan);
        setPlans(prev => [generated, ...prev]);
      }
    } catch {
      // Fallback update
      setCurrentPlan(DEFAULT_PLAN);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Nutrition & Diet Planner</h1>
            <p className="text-sm text-gray-500">Personalized 7-day nutritional plans using locally available, affordable rural ingredients.</p>
          </div>
        </div>
        <button
          onClick={loadPlans}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white border border-gray-200 rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
        </button>
      </div>

      {/* Generator Card */}
      <div className="card p-6 border border-emerald-200 bg-gradient-to-br from-emerald-50/40 via-white to-emerald-50/20 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h2 className="font-bold text-gray-900 text-base">Generate Personalized Dietary Recommendation</h2>
        </div>

        <form onSubmit={handleGeneratePlan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Health Goal / Condition</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="input text-xs"
              >
                {CONDITIONS.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Your Region / Produce Zone</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="input text-xs"
              >
                {REGIONS.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-500">
              Tailored for <strong className="text-gray-700">{user?.preferredLanguage || "Hindi"}</strong> speakers with seasonal crop recommendations.
            </p>
            <button
              type="submit"
              disabled={generating}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm"
            >
              {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{generating ? "Generating Plan..." : "Generate Nutrition Plan"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Current Plan Display */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-gray-900 text-base">Active 7-Day Meal & Fitness Schedule</h3>
          </div>
          <button
            onClick={() => window.print()}
            className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print Plan
          </button>
        </div>

        <div className="prose prose-sm max-w-none text-xs text-gray-800 leading-relaxed bg-gray-50 p-5 rounded-2xl border border-gray-200/80 font-sans whitespace-pre-wrap">
          {currentPlan}
        </div>
      </div>

      {/* Saved Previous Plans */}
      {plans.length > 1 && (
        <div className="card p-6 space-y-3">
          <h4 className="font-bold text-gray-900 text-sm">Previously Generated Nutrition Plans</h4>
          <div className="space-y-2">
            {plans.slice(1).map((p, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentPlan(p.mealPlan)}
                className="p-3 bg-gray-50 hover:bg-emerald-50/50 rounded-xl border border-gray-200/80 flex items-center justify-between cursor-pointer transition-all text-xs"
              >
                <div>
                  <p className="font-semibold text-gray-900">{p.condition || "Diet Plan"}</p>
                  <p className="text-[11px] text-gray-500">{p.region} · {new Date(p.generatedAt || Date.now()).toLocaleDateString("en-IN")}</p>
                </div>
                <button className="text-emerald-700 font-bold text-xs hover:underline">
                  Load This Plan →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
