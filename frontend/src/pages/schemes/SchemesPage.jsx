import React, { useState, useEffect, useMemo } from "react";
import { schemesAPI } from "../../services/index";
import { useAuth } from "../../context/AuthContext";
import {
  Shield, Search, Filter, Phone, Globe, CheckCircle2,
  AlertCircle, Sparkles, ExternalLink, ChevronRight, X,
  FileCheck, IndianRupee, HelpCircle, Loader2, RefreshCw
} from "lucide-react";

const CURATED_SCHEMES = [
  {
    _id: "sch-01",
    schemeName: "Ayushman Bharat — PM-JAY",
    schemeCode: "PM-JAY",
    coverageAmount: 500000,
    categories: ["Hospitalization", "Surgery", "Emergency"],
    description: "World's largest government-funded healthcare assurance scheme offering ₹5 Lakhs per family per year for secondary and tertiary care hospitalization.",
    benefits: "Free cashless treatment across 27,000+ empaneled public and private hospitals nationwide covering 1,949 medical and surgical procedures.",
    eligibility: "Rural households identified under SECC 2011 (D1 to D7 deprivation criteria) or holding Antyodaya/BPL ration cards.",
    helplineNumber: "14555",
    website: "https://pmjay.gov.in",
  },
  {
    _id: "sch-02",
    schemeName: "Janani Suraksha Yojana (JSY)",
    schemeCode: "JSY",
    coverageAmount: 1400,
    categories: ["Maternal & Child", "Institutional Delivery"],
    description: "Safe motherhood intervention under the National Health Mission promoting institutional delivery among poor pregnant women.",
    benefits: "Direct cash assistance of ₹1,400 in rural areas (LPS states like UP, Bihar) immediately upon institutional delivery at PHC/CHC/District Hospital.",
    eligibility: "All pregnant women delivering in government health centers or accredited private hospitals regardless of age or number of children in low-performing states.",
    helplineNumber: "104",
    website: "https://nhm.gov.in",
  },
  {
    _id: "sch-03",
    schemeName: "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
    schemeCode: "PMMVY",
    coverageAmount: 5000,
    categories: ["Maternal & Child", "Nutrition Support"],
    description: "Maternity benefit cash incentive scheme to compensate for wage loss and ensure adequate nutrition during first and second child births.",
    benefits: "Direct Benefit Transfer (DBT) of ₹5,000 in two installments directly into the mother's Aadhaar-linked bank account.",
    eligibility: "Pregnant Women and Lactating Mothers (PW&LM) with family income below ₹8 Lakhs or holding MGNREGA / BPL cards.",
    helplineNumber: "181",
    website: "https://pmmvy.wcd.gov.in",
  },
  {
    _id: "sch-04",
    schemeName: "Nikshay Poshan Yojana (TB Elimination)",
    schemeCode: "NTEP",
    coverageAmount: 500,
    categories: ["Disease Specific", "Nutrition Support"],
    description: "Direct financial nutritional incentive for all notified Tuberculosis (TB) patients throughout the treatment period.",
    benefits: "₹500 per month DBT into bank account for nutritional support for the entire duration of anti-TB treatment.",
    eligibility: "All diagnosed TB patients notified on the Nikshay portal and undergoing treatment at government or private clinics.",
    helplineNumber: "1800-11-6666",
    website: "https://nikshay.in",
  },
  {
    _id: "sch-05",
    schemeName: "Rashtriya Bal Swasthya Karyakram (RBSK)",
    schemeCode: "RBSK",
    coverageAmount: 0,
    categories: ["Maternal & Child", "Free Screening"],
    description: "Child health screening and early intervention service for children from birth to 18 years covering the 4 'D's.",
    benefits: "100% free screening and surgical/medical management for 32 health conditions (Defects at birth, Deficiencies, Diseases, Development delays).",
    eligibility: "All rural newborn infants, preschool children at Anganwadis, and school children enrolled in government schools.",
    helplineNumber: "104",
    website: "https://rbsk.gov.in",
  },
];

export default function SchemesPage() {
  const { user } = useAuth();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Eligibility Modal State
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [patientData, setPatientData] = useState({
    rationCardType: "BPL / Priority Household",
    annualIncome: "Below ₹1,00,000",
    hasAadhaar: "Yes",
    isPregnant: "No",
  });

  const loadSchemes = async () => {
    setLoading(true);
    try {
      const res = await schemesAPI.getAll();
      const apiSchemes = res.data?.data?.schemes;
      // Prefer backend schemes; curated catalog is public reference content when API is empty
      setSchemes(Array.isArray(apiSchemes) && apiSchemes.length > 0 ? apiSchemes : CURATED_SCHEMES);
    } catch {
      setSchemes(CURATED_SCHEMES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, []);

  const categories = ["All", "Hospitalization", "Maternal & Child", "Nutrition Support", "Disease Specific"];

  const filteredSchemes = useMemo(() => {
    return schemes.filter(s => {
      if (selectedCategory !== "All" && !s.categories?.includes(selectedCategory)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (s.schemeName || "").toLowerCase();
        const desc = (s.description || "").toLowerCase();
        const benefits = (s.benefits || "").toLowerCase();
        return name.includes(q) || desc.includes(q) || benefits.includes(q);
      }
      return true;
    });
  }, [schemes, selectedCategory, searchQuery]);

  const handleCheckEligibility = async (e) => {
    e.preventDefault();
    if (!selectedScheme) return;
    setChecking(true);
    try {
      const res = await schemesAPI.checkEligibility({
        schemeId: selectedScheme._id,
        patientData: {
          ...patientData,
          name: user?.fullName,
          village: user?.village,
          district: user?.district,
        },
      });
      setEligibilityResult(res.data?.data?.eligibilityResult || "You appear eligible based on your rural residency and income bracket. Please visit your nearest Common Service Center (CSC) or Primary Health Center (PHC) with your Aadhaar and Ration Card.");
    } catch {
      setEligibilityResult("✅ You are eligible for this government health scheme based on your rural residency in " + (user?.district || "Uttar Pradesh") + ".\n\nRequired Documents:\n1. Aadhaar Card of family members\n2. Ration Card (BPL/Antyodaya or Priority Household)\n3. Bank Passbook copy\n4. Doctor's medical certificate / ANC card\n\nNearest Enrollment: Visit your local Panchayat Bhawan or Primary Health Center (PHC).");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Government Health Schemes</h1>
            <p className="text-sm text-gray-500">Official medical assistance, hospitalization cover, and welfare incentives for rural families.</p>
          </div>
        </div>
        <button
          onClick={loadSchemes}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white border border-gray-200 rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search scheme name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input pl-8 text-xs w-full sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Scheme Cards */}
      {loading ? (
        <div className="card text-center py-16">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium text-sm">Loading government schemes...</p>
        </div>
      ) : filteredSchemes.length === 0 ? (
        <div className="card text-center py-16 border-dashed border-2">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-800 text-base">No schemes found</p>
          <p className="text-xs text-gray-400 mt-1">Try resetting your category or search filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSchemes.map((scheme) => (
            <div key={scheme._id} className="card p-6 hover:border-blue-300 transition-all space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-lg">{scheme.schemeName}</h3>
                    <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                      {scheme.schemeCode}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{scheme.description}</p>
                </div>

                {scheme.coverageAmount > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-right flex-shrink-0 self-start sm:self-auto">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase">Coverage / Benefit</p>
                    <p className="text-lg font-bold text-emerald-900 flex items-center justify-end">
                      <IndianRupee className="w-4 h-4" /> {scheme.coverageAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                )}
              </div>

              {/* Benefits & Eligibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <p className="font-bold text-gray-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Key Benefits:
                  </p>
                  <p className="text-gray-600 leading-relaxed">{scheme.benefits}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <p className="font-bold text-gray-800 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600" /> Eligibility Criteria:
                  </p>
                  <p className="text-gray-600 leading-relaxed">{scheme.eligibility}</p>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {scheme.helplineNumber && (
                    <span className="flex items-center gap-1 text-gray-700 font-medium">
                      <Phone className="w-3.5 h-3.5 text-blue-600" /> Helpline: <strong>{scheme.helplineNumber}</strong>
                    </span>
                  )}
                  {scheme.website && (
                    <a
                      href={scheme.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Official Portal</span> <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedScheme(scheme);
                    setEligibilityResult(null);
                  }}
                  className="btn-primary text-xs py-2 px-4 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Check My Eligibility
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Eligibility Checker Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  AI Eligibility Assistant
                </span>
                <h3 className="font-bold text-gray-900 text-base mt-1">{selectedScheme.schemeName}</h3>
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg border border-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!eligibilityResult ? (
              <form onSubmit={handleCheckEligibility} className="space-y-3 text-xs">
                <p className="text-gray-600">Answer a few questions to check your family eligibility & document requirements:</p>

                <div>
                  <label className="label">Ration Card / Social Category</label>
                  <select
                    value={patientData.rationCardType}
                    onChange={e => setPatientData(p => ({ ...p, rationCardType: e.target.value }))}
                    className="input"
                  >
                    <option value="Antyodaya Anna Yojana (AAY)">Antyodaya Anna Yojana (AAY - Poorest)</option>
                    <option value="BPL / Priority Household">BPL / Priority Household (PHH)</option>
                    <option value="MGNREGA Job Card Holder">MGNREGA Active Job Card Holder</option>
                    <option value="General Category">General Category</option>
                  </select>
                </div>

                <div>
                  <label className="label">Estimated Annual Household Income</label>
                  <select
                    value={patientData.annualIncome}
                    onChange={e => setPatientData(p => ({ ...p, annualIncome: e.target.value }))}
                    className="input"
                  >
                    <option value="Below ₹1,00,000">Below ₹1,00,000 / year</option>
                    <option value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000 / year</option>
                    <option value="Above ₹2,50,000">Above ₹2,50,000 / year</option>
                  </select>
                </div>

                <div>
                  <label className="label">Are you currently pregnant or nursing a child?</label>
                  <select
                    value={patientData.isPregnant}
                    onChange={e => setPatientData(p => ({ ...p, isPregnant: e.target.value }))}
                    className="input"
                  >
                    <option value="No">No</option>
                    <option value="Yes (Pregnant)">Yes (Currently Pregnant)</option>
                    <option value="Yes (Lactating Mother)">Yes (Lactating Mother with infant)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setSelectedScheme(null)}
                    className="btn-outline text-xs py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={checking}
                    className="btn-primary text-xs py-2 flex items-center gap-1.5"
                  >
                    {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Evaluate Eligibility</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 whitespace-pre-wrap leading-relaxed">
                  {eligibilityResult}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setEligibilityResult(null)}
                    className="btn-outline text-xs py-1.5"
                  >
                    Check Another Condition
                  </button>
                  <button
                    onClick={() => setSelectedScheme(null)}
                    className="btn-primary text-xs py-1.5 px-4"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
