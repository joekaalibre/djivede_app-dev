import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from './Card';
import Button from './Button';

interface InvestmentFormProps {
  projectId: string;
  minimumInvestment: number;
  pricePerModule?: number;
  expectedReturn: number;
}

const InvestmentForm: React.FC<InvestmentFormProps> = ({
  projectId,
  minimumInvestment,
  pricePerModule,
  expectedReturn,
}) => {
  const [amount, setAmount] = useState(minimumInvestment);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic would go here
    console.log({ projectId, amount, name, email, phone });
    alert('Merci pour votre intérêt ! Un conseiller vous contactera prochainement.');
  };
  
  const calculateReturn = () => {
    return (amount * expectedReturn) / 100;
  };
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-FR') + ' €';
  };
  
  const presetAmounts = [
    minimumInvestment,
    pricePerModule || minimumInvestment * 2,
    pricePerModule ? pricePerModule * 2 : minimumInvestment * 5,
    pricePerModule ? pricePerModule * 5 : minimumInvestment * 10,
  ];

  return (
    <section id="invest" className="py-12 bg-gradient-to-b from-white to-accent-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-t-4 border-accent-500">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="absolute -inset-1">
                  <div className="w-full h-full mx-auto opacity-30 blur-lg filter bg-gradient-to-r from-accent-400 to-primary-500"></div>
                </div>
                <h2 className="relative text-2xl md:text-3xl font-bold text-center">
                  <span className="text-accent-500">Investir</span> dans ce projet
                </h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Calculez votre rendement</h3>
                
                <div className="mb-6">
                  <label className="block text-neutral-700 font-medium mb-2">
                    Montant de votre investissement
                  </label>
                  
                  <div className="flex items-center mb-4">
                    <span className="text-lg font-medium text-neutral-500 mr-2">€</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min={minimumInvestment}
                      step={100}
                      className="input"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                    {presetAmounts.map((presetAmount, index) => (
                      <Button
                        key={index}
                        variant={amount === presetAmount ? 'accent' : 'outline'}
                        size="sm"
                        onClick={() => setAmount(presetAmount)}
                        fullWidth
                      >
                        {formatCurrency(presetAmount)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-accent-50 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-lg mb-4">Rendement estimé</h4>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-neutral-600">Investissement</span>
                    <span className="font-medium">{formatCurrency(amount)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-neutral-600">Taux de rendement</span>
                    <span className="font-medium">{expectedReturn}%</span>
                  </div>
                  
                  <div className="border-t border-accent-200 my-3"></div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-800 font-medium">Rendement annuel</span>
                    <span className="text-accent-600 text-xl font-bold">{formatCurrency(calculateReturn())}</span>
                  </div>
                </div>
                
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="text-primary-500 mr-3 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm text-neutral-700">
                      Les rendements passés ne préjugent pas des rendements futurs. 
                      Tout investissement comporte des risques.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Vos informations</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-neutral-700 font-medium mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input"
                      placeholder="Votre nom et prénom"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-neutral-700 font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                      placeholder="votre.email@exemple.com"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-neutral-700 font-medium mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input"
                      placeholder="+229 XX XX XX XX"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center mb-6">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      className="h-4 w-4 text-accent-500 focus:ring-accent-500 border-neutral-300 rounded"
                      required
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-neutral-700">
                      J'accepte les <a href="#" className="text-primary-500 hover:underline">conditions générales</a> et la <a href="#" className="text-primary-500 hover:underline">politique de confidentialité</a>
                    </label>
                  </div>
                  
                  <Button
                    variant="accent"
                    type="submit"
                    fullWidth
                    size="lg"
                    className="font-bold"
                  >
                    Je souhaite investir {formatCurrency(amount)}
                  </Button>
                  
                  <div className="mt-4 text-center">
                    <a
                      href="https://wa.me/2290152532323?text=Bonjour%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20les%20projets%20d'investissement%20Djivedé"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary-500 hover:text-primary-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Discuter sur WhatsApp
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default InvestmentForm;