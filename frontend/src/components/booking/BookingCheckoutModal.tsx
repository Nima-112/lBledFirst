import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  Check,
  CreditCard,
  Globe,
  Landmark,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Mountain,
  Phone,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { FieldError, FormErrorBanner } from "@/components/ui/form-feedback";
import { COUNTRIES } from "@/lib/countries";
import { parseApiError } from "@/lib/api-errors";

const SERVICE_FEE = 45;

export type CheckoutTraveler = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
};

type PaymentMethod = "card" | "paypal";

export type BookingCheckoutItem = {
  id: string;
  title: string;
  hostName: string;
  region: string;
  guests: number;
  unitPrice: number;
  coverImage?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  item: BookingCheckoutItem;
  variant?: "booking" | "formation";
  defaultEmail?: string;
  defaultName?: string;
  onConfirm: (traveler: CheckoutTraveler) => Promise<void>;
};

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 pl-10 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

function splitName(fullName?: string) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

const COPY = {
  booking: {
    title: "Complete your booking",
    detailsHeading: "Traveler information",
    confirmedTitle: "Booking confirmed!",
    confirmedBody:
      "Your request has been recorded. You will receive a confirmation by email.",
    lineItem: (guests: number) => `Experience (${guests} guest${guests > 1 ? "s" : ""})`,
  },
  formation: {
    title: "Complete your purchase",
    detailsHeading: "Enrollment details",
    confirmedTitle: "Purchase confirmed!",
    confirmedBody:
      "You now have immediate access to the training. A receipt will be sent by email.",
    lineItem: () => "Training",
  },
} as const;

export function BookingCheckoutModal({
  open,
  onClose,
  item,
  variant = "booking",
  defaultEmail = "",
  defaultName = "",
  onConfirm,
}: Props) {
  const isFormation = variant === "formation";
  const copy = isFormation ? COPY.formation : COPY.booking;
  const [mounted, setMounted] = useState(false);
  const nameParts = useMemo(() => splitName(defaultName), [defaultName]);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [traveler, setTraveler] = useState<CheckoutTraveler>({
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    email: defaultEmail,
    phone: "",
    country: "",
    city: "",
  });

  const subtotal = item.unitPrice * item.guests;
  const grandTotal = subtotal + SERVICE_FEE;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const parts = splitName(defaultName);
    setTraveler({
      firstName: parts.firstName,
      lastName: parts.lastName,
      email: defaultEmail,
      phone: "",
      country: "",
      city: "",
    });
    setMethod("card");
    setProcessing(false);
    setDone(false);
    setError(null);
    setFieldErrors({});
  }, [open, defaultEmail, defaultName]);

  const countryOptions = COUNTRIES.map((c) => ({
    value: c.name,
    label: c.name,
    hint: c.flag,
  }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!traveler.firstName.trim()) next.firstName = "First name is required.";
    if (!traveler.lastName.trim()) next.lastName = "Last name is required.";
    if (!traveler.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(traveler.email)) next.email = "Invalid email.";
    if (!traveler.phone.trim()) next.phone = "Phone is required.";
    if (!traveler.country.trim()) next.country = "Country is required.";
    if (!traveler.city.trim()) next.city = "City is required.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    if (method !== "card") {
      setError("Only card payment via CMI is available for now.");
      return;
    }

    try {
      setProcessing(true);
      await onConfirm(traveler);
      setDone(true);
    } catch (err) {
      const parsed = parseApiError(err, "Payment could not be completed.");
      setError(parsed.message);
      setFieldErrors((prev) => ({ ...prev, ...parsed.fieldErrors }));
    } finally {
      setProcessing(false);
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="notranslate"
      translate="no"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-warm sm:rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <h2 id="checkout-modal-title" className="font-display text-xl font-extrabold text-foreground">
              {copy.title}
            </h2>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-background/60 p-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary/15 text-primary">
                {item.coverImage ? (
                  <img src={item.coverImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Mountain className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {isFormation ? `Instructor: ${item.hostName}` : `Host: ${item.hostName}`}
                </p>
                {!isFormation && (
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 text-primary" />
                    {item.region} · {item.guests} guest{item.guests > 1 ? "s" : ""}
                  </p>
                )}
                {isFormation && item.region && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.region}</p>
                )}
              </div>
              <span className="font-display text-lg font-extrabold text-primary">
                {subtotal} MAD
              </span>
            </div>

            {done ? (
              <div className="mt-8 flex flex-col items-center gap-3 py-4 text-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                  <Check className="h-7 w-7" />
                </span>
                <p className="font-display text-xl font-extrabold">{copy.confirmedTitle}</p>
                <p className="text-sm text-muted-foreground">{copy.confirmedBody}</p>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-5 space-y-5">
                <FormErrorBanner message={error} />

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {copy.detailsHeading}
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          className={inputCls}
                          placeholder="First name"
                          value={traveler.firstName}
                          onChange={(e) => setTraveler({ ...traveler, firstName: e.target.value })}
                        />
                      </div>
                      <FieldError message={fieldErrors.firstName} />
                    </div>
                    <div>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          className={inputCls}
                          placeholder="Last name"
                          value={traveler.lastName}
                          onChange={(e) => setTraveler({ ...traveler, lastName: e.target.value })}
                        />
                      </div>
                      <FieldError message={fieldErrors.lastName} />
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="email"
                        className={inputCls}
                        placeholder="Email"
                        value={traveler.email}
                        onChange={(e) => setTraveler({ ...traveler, email: e.target.value })}
                      />
                    </div>
                    <FieldError message={fieldErrors.email} />
                  </div>

                  <div className="mt-3">
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        className={inputCls}
                        placeholder="Phone (e.g. +212 6XX XXX XXX)"
                        value={traveler.phone}
                        onChange={(e) => setTraveler({ ...traveler, phone: e.target.value })}
                      />
                    </div>
                    <FieldError message={fieldErrors.phone} />
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <Combobox
                        options={countryOptions}
                        value={traveler.country}
                        onChange={(country) => setTraveler({ ...traveler, country })}
                        placeholder="Country"
                        searchPlaceholder="Search country…"
                      />
                      <FieldError message={fieldErrors.country} />
                    </div>
                    <div>
                      <div className="relative">
                        <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          className={inputCls}
                          placeholder="City"
                          value={traveler.city}
                          onChange={(e) => setTraveler({ ...traveler, city: e.target.value })}
                        />
                      </div>
                      <FieldError message={fieldErrors.city} />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Payment method
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: "card" as const, label: "Credit card", icon: CreditCard },
                        { id: "paypal" as const, label: "PayPal", icon: Landmark },
                      ] as const
                    ).map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setMethod(id)}
                        className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-[11px] font-bold transition ${
                          method === id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>

                  {method === "card" && (
                    <div className="mt-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 text-xs leading-relaxed text-muted-foreground">
                      <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-sky-600" />
                      Secure payment via <strong className="text-foreground">CMI + 3D Secure</strong>.
                      You will be redirected to the secure CMI page. No card data is stored on our site.
                    </div>
                  )}
                  {method === "paypal" && (
                    <p className="mt-3 rounded-xl border border-dashed border-border bg-background p-3 text-xs text-muted-foreground">
                      PayPal will be available soon. Please use card payment via CMI.
                    </p>
                  )}
                </div>

                <div className="space-y-2 rounded-2xl border border-border bg-background/60 p-4 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      {isFormation ? copy.lineItem() : COPY.booking.lineItem(item.guests)}
                    </span>
                    <span>{subtotal} MAD</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Service fee</span>
                    <span>{SERVICE_FEE} MAD</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-display text-base font-extrabold text-foreground">
                    <span>Total</span>
                    <span>{grandTotal} MAD</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-foreground bg-foreground px-5 py-3 text-sm font-bold text-background shadow-warm transition hover:scale-[1.01] disabled:opacity-70"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Redirecting to CMI…
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pay {grandTotal} MAD — Continue to CMI ↗
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-muted-foreground">
                  <ShieldCheck className="mr-1 inline h-3 w-3 text-emerald-600" />
                  SSL · CMI certified · Visa, Mastercard accepted
                </p>
              </form>
            )}
        </motion.div>
      </motion.div>
    </div>,
    document.body,
  );
}
