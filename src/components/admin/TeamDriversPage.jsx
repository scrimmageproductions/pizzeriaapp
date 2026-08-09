import { useState } from "react";
import { Car, Check, Copy, MessageSquare, Phone, ShieldCheck, UserPlus, Users } from "lucide-react";
import { useShopActions, useShopState } from "../../context/ShopContext";
import Card from "../shared/Card";

const STAGES = [
  { key: "new", label: "New Applicants" },
  { key: "contacted", label: "Contacted" },
  { key: "hired", label: "Hired" },
];

const STATUS_META = {
  OFF_CLOCK: { label: "Off Clock", className: "bg-gray-100 text-gray-500" },
  IN_STORE: { label: "In Store", className: "bg-[#F39C12]/10 text-[#F39C12]" },
  ON_ROAD: { label: "On Road", className: "bg-[#00A651]/10 text-[#00A651]" },
};

function ApplicantCard({ applicant, onAdvance, onHire }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <p className="text-sm font-bold text-gray-900">{applicant.name}</p>
      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
        <Car size={11} /> {applicant.vehicleType}
      </p>
      <p className="text-xs text-gray-500">{applicant.phone}</p>
      {applicant.hasLicenseInsurance && (
        <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#00A651]">
          <ShieldCheck size={11} /> Licensed & insured
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <a
          href={`sms:${applicant.phone}`}
          className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600 hover:bg-gray-200"
        >
          <MessageSquare size={11} /> Text
        </a>
        {applicant.stage === "new" && (
          <button
            onClick={() => onAdvance(applicant.id, "contacted")}
            className="rounded-full bg-gray-900 px-2.5 py-1 text-xs font-bold text-white hover:bg-gray-700"
          >
            Mark Contacted
          </button>
        )}
        {applicant.stage === "contacted" && (
          <button
            onClick={() => onHire(applicant.id)}
            className="rounded-full bg-[#00A651] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#00913f]"
          >
            Hire as Driver
          </button>
        )}
        {applicant.stage === "hired" && (
          <span className="rounded-full bg-[#00A651]/10 px-2.5 py-1 text-xs font-bold text-[#00A651]">→ Added to roster</span>
        )}
      </div>
    </div>
  );
}

function DriverLinkButton({ driver }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/driver/${driver.authToken}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // clipboard unavailable — link is still shown below for manual copy
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-2">
      <button onClick={copy} className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-200">
        {copied ? <Check size={12} className="text-[#00A651]" /> : <Copy size={12} />}
        {copied ? "Copied!" : "Generate Driver Login Link"}
      </button>
      {copied && <p className="mt-1.5 break-all font-mono text-[11px] text-gray-400">{link}</p>}
    </div>
  );
}

export default function TeamDriversPage() {
  const { applicants, drivers } = useShopState();
  const { updateApplicantStage, hireApplicant } = useShopActions();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-gray-900">
          <Users size={22} /> Team & Drivers
        </h1>
        <p className="text-sm text-gray-500">Hire and dispatch your own fleet — no third-party delivery network required.</p>
      </div>

      <Card title="Applicant Tracking" description="Applications from your storefront's hiring page land here." icon={UserPlus}>
        {applicants.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
            No applicants yet — share your storefront's "We're Hiring Drivers!" link.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {STAGES.map((stage) => {
              const inStage = applicants.filter((a) => a.stage === stage.key);
              return (
                <div key={stage.key} className="rounded-xl bg-gray-50 p-3">
                  <div className="mb-2 flex items-center justify-between px-0.5">
                    <h4 className="text-xs font-extrabold uppercase tracking-wide text-gray-500">{stage.label}</h4>
                    <span className="text-xs font-bold text-gray-400">{inStage.length}</span>
                  </div>
                  <div className="space-y-2">
                    {inStage.length === 0 ? (
                      <p className="py-4 text-center text-[11px] text-gray-300">Empty</p>
                    ) : (
                      inStage.map((a) => (
                        <ApplicantCard key={a.id} applicant={a} onAdvance={updateApplicantStage} onHire={hireApplicant} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card title="Active Roster" description="Hired drivers, ready to clock in at the Dispatch Terminal." icon={Car}>
        {drivers.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
            No drivers hired yet.
          </p>
        ) : (
          <div className="space-y-3">
            {drivers.map((d) => {
              const meta = STATUS_META[d.status] || STATUS_META.OFF_CLOCK;
              return (
                <div key={d.id} className="rounded-xl border border-gray-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{d.name}</p>
                      <p className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone size={11} /> {d.phone} · {d.vehicleType}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">PIN {d.pin}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${meta.className}`}>{meta.label}</span>
                  </div>
                  <DriverLinkButton driver={d} />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
