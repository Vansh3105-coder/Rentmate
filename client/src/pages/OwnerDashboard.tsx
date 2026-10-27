import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Archive, BadgeCheck, Building2, Check, Clock3, Edit3, Home as HomeIcon, LogOut, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type ListingForm = {
  title: string;
  propertyType: "flat" | "house" | "apartment" | "pg" | "studio";
  city: string;
  locality: string;
  monthlyRent: number;
  bedrooms: number;
  furnishing: "unfurnished" | "semi_furnished" | "fully_furnished";
  description: string;
  imageUrl: string;
};

const emptyForm: ListingForm = {
  title: "",
  propertyType: "apartment",
  city: "",
  locality: "",
  monthlyRent: 25000,
  bedrooms: 1,
  furnishing: "semi_furnished",
  description: "",
  imageUrl: "",
};

const propertyTypeLabel: Record<string, string> = {
  flat: "Flat",
  house: "House",
  apartment: "Apartment",
  pg: "PG",
  studio: "Studio",
};

function formatRent(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export default function OwnerDashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [form, setForm] = useState<ListingForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const utils = trpc.useUtils();
  useEffect(() => {
    if (!loading && user && !user.onboardingComplete) window.location.href = "/onboarding";
  }, [loading, user]);
  const listingsQuery = trpc.owner.list.useQuery(undefined, { enabled: isAuthenticated && user?.accountType === "owner" && user.onboardingComplete, retry: false });
  const createMutation = trpc.owner.create.useMutation({
    onSuccess: async () => {
      setForm(emptyForm);
      setEditingId(null);
      await utils.owner.list.invalidate();
      toast.success("Your place is saved as a draft", { description: "Review the details, then publish when it feels ready." });
    },
    onError: (error) => toast.error(error.message),
  });
  const updateMutation = trpc.owner.update.useMutation({
    onSuccess: async () => {
      setForm(emptyForm);
      setEditingId(null);
      await utils.owner.list.invalidate();
      toast.success("Listing details updated");
    },
    onError: (error) => toast.error(error.message),
  });
  const statusMutation = trpc.owner.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.owner.list.invalidate();
      toast.success("Listing status updated");
    },
    onError: (error) => toast.error(error.message),
  });

  const listings = listingsQuery.data ?? [];
  const counts = useMemo(() => ({
    total: listings.length,
    published: listings.filter((listing) => listing.status === "published").length,
    drafts: listings.filter((listing) => listing.status === "draft").length,
  }), [listings]);

  if (loading || (!isAuthenticated && !user)) {
    return <div className="dashboard-loading"><div className="dashboard-loading__mark"><HomeIcon size={22} /></div><p>Preparing your Nestly workspace…</p></div>;
  }

  if (!isAuthenticated) {
    return <div className="dashboard-loading"><div className="dashboard-empty"><BadgeCheck size={26} /><h1>Sign in to manage your places.</h1><p>Nestly uses your account to keep every listing connected to the right owner.</p><button type="button" className="button button--dark" onClick={() => startLogin()}>Continue with Nestly <ArrowUpRight size={16} /></button></div></div>;
  }

  if (user?.accountType !== "owner") {
    return <div className="dashboard-loading"><div className="dashboard-empty"><BadgeCheck size={26} /><h1>Owner access needs an owner profile.</h1><p>Tell Nestly a little more about how you want to use the platform before listing a place.</p><a className="button button--dark" href="/onboarding?mode=owner">Set up owner profile <ArrowUpRight size={16} /></a></div></div>;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = { ...form, monthlyRent: Number(form.monthlyRent), bedrooms: Number(form.bedrooms) };
    if (editingId) updateMutation.mutate({ ...input, propertyId: editingId });
    else createMutation.mutate(input);
  };

  const startEditing = (listing: (typeof listings)[number]) => {
    setEditingId(listing.id);
    setForm({
      title: listing.title,
      propertyType: listing.propertyType,
      city: listing.city,
      locality: listing.locality,
      monthlyRent: listing.monthlyRent,
      bedrooms: listing.bedrooms,
      furnishing: listing.furnishing,
      description: listing.description ?? "",
      imageUrl: listing.imageUrl ?? "",
    });
    document.getElementById("new-listing")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-rail">
        <a href="/" className="brand dashboard-brand" aria-label="Back to Nestly home"><span className="brand-mark"><span /><span /></span><span>Nestly</span></a>
        <div className="dashboard-rail__intro"><span className="eyebrow">Owner workspace</span><strong>Make your place<br /><em>easy to choose.</em></strong></div>
        <nav className="dashboard-nav" aria-label="Owner dashboard navigation"><a className="is-active" href="#overview"><Building2 size={17} /> Overview</a><a href="#new-listing"><Plus size={17} /> Add a listing</a><a href="/" ><HomeIcon size={17} /> Public site</a></nav>
        <div className="dashboard-rail__footer"><span>Signed in as</span><strong>{user?.name || user?.email || "Nestly owner"}</strong><button type="button" onClick={() => logout()}><LogOut size={15} /> Sign out</button></div>
      </aside>

      <main className="dashboard-main" id="overview">
        <header className="dashboard-topbar"><div><span className="eyebrow">Good to see you</span><h1>Your places, with context.</h1></div><a href="/" className="dashboard-topbar__link">View public site <ArrowUpRight size={15} /></a></header>

        <section className="dashboard-stats" aria-label="Listing summary">
          <article><span className="dashboard-stat-icon"><Building2 size={18} /></span><strong>{counts.total}</strong><span>Total places</span></article>
          <article><span className="dashboard-stat-icon dashboard-stat-icon--clay"><BadgeCheck size={18} /></span><strong>{counts.published}</strong><span>Published</span></article>
          <article><span className="dashboard-stat-icon dashboard-stat-icon--soft"><Clock3 size={18} /></span><strong>{counts.drafts}</strong><span>Drafts to finish</span></article>
        </section>

        <section className="dashboard-grid" id="new-listing">
          <article className="dashboard-card dashboard-form-card"><div className="dashboard-card__heading"><div><span className="eyebrow">{editingId ? "Refine the good details" : "Start with the good details"}</span><h2>{editingId ? "Edit place." : "Add a place."}</h2></div><span className="dashboard-card__number">01</span></div><p className="dashboard-card__intro">Give future residents enough context to picture a good day there.</p>
            <form className="listing-form" onSubmit={handleSubmit}>
              <label>Listing title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. The Courtyard Flat" /></label>
              <div className="form-row"><label>Property type<select value={form.propertyType} onChange={(event) => setForm({ ...form, propertyType: event.target.value as typeof form.propertyType })}><option value="flat">Flat</option><option value="house">House</option><option value="apartment">Apartment</option><option value="pg">PG</option><option value="studio">Studio</option></select></label><label>Bedrooms<input type="number" min="1" max="20" value={form.bedrooms} onChange={(event) => setForm({ ...form, bedrooms: Number(event.target.value) })} /></label></div>
              <div className="form-row"><label>City<input required value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="Bengaluru" /></label><label>Locality<input required value={form.locality} onChange={(event) => setForm({ ...form, locality: event.target.value })} placeholder="Indiranagar" /></label></div>
              <div className="form-row"><label>Monthly rent<input required type="number" min="0" value={form.monthlyRent} onChange={(event) => setForm({ ...form, monthlyRent: Number(event.target.value) })} /></label><label>Furnishing<select value={form.furnishing} onChange={(event) => setForm({ ...form, furnishing: event.target.value as typeof form.furnishing })}><option value="unfurnished">Unfurnished</option><option value="semi_furnished">Semi-furnished</option><option value="fully_furnished">Fully furnished</option></select></label></div>
              <label>Image URL <span className="label-optional">optional</span><input type="url" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="https://…" /></label>
              <label>Short description <span className="label-optional">optional</span><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What makes this place worth coming home to?" /></label>
              <div className="listing-form__actions"><button type="submit" className="button button--peach" disabled={createMutation.isPending || updateMutation.isPending}>{createMutation.isPending || updateMutation.isPending ? "Saving…" : editingId ? "Save changes" : "Save listing draft"} <ArrowUpRight size={16} /></button>{editingId && <button type="button" className="button button--quiet" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel edit</button>}</div>
            </form>
          </article>

          <article className="dashboard-card dashboard-listings-card"><div className="dashboard-card__heading"><div><span className="eyebrow">Your places</span><h2>Listings.</h2></div><span className="dashboard-card__number">{String(listings.length).padStart(2, "0")}</span></div>
            {listingsQuery.isLoading ? <div className="listing-empty"><Clock3 size={22} /><p>Loading your listings…</p></div> : listings.length === 0 ? <div className="listing-empty"><MapPin size={24} /><h3>Your first place starts here.</h3><p>Fill out the form and save a draft. You can publish it when every detail feels right.</p></div> : <div className="listing-stack">{listings.map((listing) => <article className="listing-row" key={listing.id}><div className="listing-row__image">{listing.imageUrl ? <img src={listing.imageUrl} alt="" /> : <Building2 size={22} />}</div><div className="listing-row__copy"><strong>{listing.title}</strong><span><MapPin size={13} /> {listing.locality}, {listing.city}</span><small>{propertyTypeLabel[listing.propertyType]} · {formatRent(listing.monthlyRent)} / month</small></div><div className={`listing-status listing-status--${listing.status}`}>{listing.status}</div><button type="button" className="listing-row__action" onClick={() => startEditing(listing)} aria-label={`Edit ${listing.title}`}><Edit3 size={15} /></button><button type="button" className="listing-row__action" onClick={() => statusMutation.mutate({ propertyId: listing.id, status: listing.status === "published" ? "archived" : "published" })} aria-label={listing.status === "published" ? "Archive listing" : "Publish listing"}>{listing.status === "published" ? <Archive size={16} /> : <Check size={16} />}</button></article>)}</div>}
          </article>
        </section>
      </main>
    </div>
  );
}
