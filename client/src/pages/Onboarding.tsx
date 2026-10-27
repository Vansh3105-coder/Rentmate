import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, BadgeCheck, Check, FileCheck2, Home as HomeIcon, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type AccountType = "renter" | "owner";
type PropertyType = "flat" | "house" | "apartment" | "pg" | "studio";
type ProofType = "government_id" | "ownership_document" | "gst_certificate" | "rental_authorization";

const proofLabels: Record<ProofType, string> = {
  government_id: "Government ID",
  ownership_document: "Ownership document",
  gst_certificate: "GST certificate",
  rental_authorization: "Rental authorization",
};

export default function Onboarding() {
  const { user, loading, isAuthenticated } = useAuth({ redirectOnUnauthenticated: true });
  const initialOwner = useMemo(() => new URLSearchParams(window.location.search).get("mode") === "owner", []);
  const [accountType, setAccountType] = useState<AccountType>(initialOwner ? "owner" : "renter");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [proofType, setProofType] = useState<ProofType>("government_id");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofDataUrl, setProofDataUrl] = useState("");
  const saveProfile = trpc.account.saveProfile.useMutation();
  const submitProof = trpc.account.submitOwnerProof.useMutation();

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setPhone(user.phone ?? "");
      if (user.onboardingComplete) window.location.href = user.accountType === "owner" ? "/owner" : "/";
    }
  }, [user]);

  if (loading || (!isAuthenticated && !user)) {
    return <div className="onboarding-loading"><div className="dashboard-loading__mark"><HomeIcon size={22} /></div><p>Opening your Nestly account…</p></div>;
  }

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!/[.](pdf|jpe?g|png)$/i.test(file.name)) { toast.error("Upload a PDF, JPG, or PNG file."); return; }
    if (file.size > 8 * 1024 * 1024) { toast.error("Proof documents must be 8 MB or smaller."); return; }
    const reader = new FileReader();
    reader.onload = () => { setProofFile(file); setProofDataUrl(typeof reader.result === "string" ? reader.result : ""); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await saveProfile.mutateAsync({ name, phone, accountType });
      if (accountType === "owner") {
        if (!proofFile || !proofDataUrl) { toast.error("Add one proof document so we can review your owner profile."); return; }
        await submitProof.mutateAsync({ propertyType, proofType, proofFileName: proofFile.name, proofDataUrl });
        toast.success("Owner profile submitted for review");
        window.location.href = "/owner";
      } else {
        toast.success("Your Nestly profile is ready");
        window.location.href = "/";
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not save your profile");
    }
  };

  const saving = saveProfile.isPending || submitProof.isPending;

  return (
    <main className="onboarding-page">
      <div className="onboarding-shell">
        <header className="onboarding-header"><a href="/" className="brand" aria-label="Back to Nestly home"><span className="brand-mark"><span /><span /></span><span>Nestly</span></a><span className="onboarding-step">Profile setup · 01</span></header>
        <div className="onboarding-layout">
          <aside className="onboarding-aside"><span className="eyebrow">A little context helps</span><h1>Make Nestly feel more <em>like yours.</em></h1><p>A few details help us show you better places—and keep owner listings connected to real people.</p><div className="onboarding-trust"><ShieldCheck size={17} /><span>Your contact details stay within your Nestly account.</span></div></aside>
          <section className="onboarding-card"><div className="onboarding-card__heading"><div><span className="eyebrow">First, the basics</span><h2>Tell us about you.</h2></div><BadgeCheck size={23} /></div>
            <form className="onboarding-form" onSubmit={handleSubmit}>
              <label>Full name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>
              <label>Email <span className="label-optional">from your sign-in</span><input value={user?.email ?? ""} readOnly className="is-readonly" /></label>
              <label>Contact number<input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" inputMode="tel" /></label>
              <fieldset><legend>How will you use Nestly?</legend><div className="account-choice-grid"><button type="button" className={`account-choice ${accountType === "renter" ? "is-selected" : ""}`} onClick={() => setAccountType("renter")}><HomeIcon size={19} /><strong>Find a place</strong><span>I’m looking to rent a home, flat, or PG.</span>{accountType === "renter" && <Check size={16} />}</button><button type="button" className={`account-choice ${accountType === "owner" ? "is-selected" : ""}`} onClick={() => setAccountType("owner")}><FileCheck2 size={19} /><strong>List a place</strong><span>I own or manage a place I want to rent out.</span>{accountType === "owner" && <Check size={16} />}</button></div></fieldset>
              {accountType === "owner" && <div className="owner-verification-panel"><div className="owner-verification-panel__heading"><div><span className="eyebrow">Owner verification</span><h3>Help us verify the place.</h3></div><span className="onboarding-required">Required</span></div><p>Upload one valid proof. We store the file securely and keep your review status in your account; raw ID numbers are not stored as plain text.</p><div className="form-row"><label>Place type<select value={propertyType} onChange={(event) => setPropertyType(event.target.value as PropertyType)}><option value="flat">Flat</option><option value="house">House</option><option value="apartment">Apartment</option><option value="pg">PG</option><option value="studio">Studio</option></select></label><label>Proof type<select value={proofType} onChange={(event) => setProofType(event.target.value as ProofType)}><option value="government_id">Government ID</option><option value="ownership_document">Ownership document</option><option value="gst_certificate">GST certificate</option><option value="rental_authorization">Rental authorization</option></select></label></div><label className="file-upload"><span>Verification document</span><input required type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => handleFile(event.target.files?.[0])} /><span className="file-upload__box"><FileCheck2 size={19} /><strong>{proofFile ? proofFile.name : `Choose ${proofLabels[proofType].toLowerCase()} file`}</strong><small>PDF, JPG, or PNG · 8 MB max</small></span></label><div className="verification-note"><ShieldCheck size={15} /> For PG listings, use a GST certificate or another document that proves ownership or management authorization.</div></div>}
              <button type="submit" className="button button--dark onboarding-submit" disabled={saving}>{saving ? "Saving your profile…" : accountType === "owner" ? "Submit owner profile" : "Continue to Nestly"} <ArrowUpRight size={16} /></button>
            </form>
            <a href="/" className="onboarding-back"><ArrowLeft size={14} /> Back to Nestly</a>
          </section>
        </div>
      </div>
    </main>
  );
}
