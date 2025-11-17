// ✅ InvestFormInline.tsx — Optimisé pour tunnel d'investissement Djivede
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InvestFormInline = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [amount, setAmount] = useState('50');
  const [method, setMethod] = useState<'carte' | 'virement' | 'plus-tard'>('carte');
  const [loading, setLoading] = useState(false);

  const feeRate = method === 'carte' ? 0.03 : 0;
  const total = (parseFloat(amount) || 0) * (1 + feeRate);
  const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4242';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName || isNaN(Number(amount))) {
      toast.error("Veuillez remplir tous les champs correctement.");
      return;
    }

    setLoading(true);

    const { data: existing, error: checkError } = await supabase
      .from('invest_subscribers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      toast.error("Erreur serveur. Réessayez plus tard.");
      setLoading(false);
      return;
    }

    if (existing) {
      toast.info("Vous êtes déjà inscrit avec cet email.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('invest_subscribers').insert({
      email,
      full_name: fullName,
      amount_paid: parseFloat(amount),
      paid: false,
      confirmed: false,
      payment_method: method,
    });

    if (error) {
      console.error(error);
      toast.error("Erreur lors de l'inscription : " + error.message);
      setLoading(false);
      return;
    }

    try {
      await fetch(`${backendURL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'Confirmation de votre inscription - Djivede',
          html: `Bonjour ${fullName}, merci pour votre inscription pour ${total.toFixed(2)} €.`
        })
      });

      await fetch(`${backendURL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'admin@djivede.com',
          subject: 'Nouvel investisseur',
          html: `<p>${fullName} (${email}) - ${amount} € - ${method}</p>`
        })
      });

      if (method === 'carte') {
        const res = await fetch(`${backendURL}/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Math.round(total * 100),
            success_url: `${window.location.origin}/merci?email=${encodeURIComponent(email)}`,
            cancel_url: `${window.location.origin}/annule`
          })
        });
        const data = await res.json();
        if (data?.id) {
          window.location.href = `https://checkout.stripe.com/pay/${data.id}`;
        } else {
          toast.error("Erreur de redirection vers Stripe");
        }
      } else if (method === 'virement') {
        toast.success("Inscription enregistrée. Veuillez effectuer un virement.");
        alert(`RIB : FR76 1234 5678 9000 1234 5678 901\nBénéficiaire : DJIVEDE\nMontant exact à virer : ${total.toFixed(2)} €`);
        window.location.href = `/merci?email=${encodeURIComponent(email)}`;
      } else {
        toast.success("Inscription enregistrée. Vous pourrez payer plus tard.");
        window.location.href = `/merci?email=${encodeURIComponent(email)}`;
      }
    } catch (err) {
      console.error("Erreur e-mail ou Stripe :", err);
      toast.warn("Inscription OK, mais erreur de communication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-bold text-center">Adhésion à l’espace investisseur</h3>

      <input
        type="text"
        placeholder="Nom complet"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded"
        required
      />

      <input
        type="email"
        placeholder="Adresse email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded"
        required
      />

      <input
        type="number"
        placeholder="Montant (€)"
        value={amount}
        min={50}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full border border-gray-300 p-2 rounded"
        required
      />

      <div className="space-y-2">
        <label className="block">
          <input type="radio" name="method" value="carte" checked={method === 'carte'} onChange={() => setMethod('carte')} />
          <span className="ml-2">Paiement par carte (frais +3%)</span>
        </label>
        <label className="block">
          <input type="radio" name="method" value="virement" checked={method === 'virement'} onChange={() => setMethod('virement')} />
          <span className="ml-2">Paiement par virement</span>
        </label>
        <label className="block">
          <input type="radio" name="method" value="plus-tard" checked={method === 'plus-tard'} onChange={() => setMethod('plus-tard')} />
          <span className="ml-2">Payer plus tard</span>
        </label>
      </div>

      <p className="text-sm text-gray-600">
        Total à payer : <strong>{total.toFixed(2)} €</strong>
      </p>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? 'Traitement...' : 'Valider mon inscription'}
      </button>
    </form>
  );
};

export default InvestFormInline;
