import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Search, Edit2, Trash2, Package, ShoppingBag, Calendar, CreditCard, Eye } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import ProductModal from './ProductModal';
import OrderModal from './OrderModal';
import BookingModal from './BookingModal';
import PaymentModal from './PaymentModal';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'digital' | 'physical';
  stock?: number;
  digital_content?: any;
  is_active: boolean;
  created_at: string;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

interface Booking {
  id: string;
  service_id: string;
  user_id: string;
  date: string;
  status: string;
  notes?: string;
  created_at: string;
}

interface Payment {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  method: string;
  transaction_id?: string;
  created_at: string;
}

const EcommerceManager = () => {
  const [activeView, setActiveView] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    fetchData();
  }, [activeView]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let data;
      switch (activeView) {
        case 'products':
          const { data: productsData } = await supabase
            .from('coaching_products')
            .select('*')
            .order('created_at', { ascending: false });
          setProducts(productsData || []);
          break;
        case 'orders':
          const { data: ordersData } = await supabase
            .from('coaching_orders')
            .select('*')
            .order('created_at', { ascending: false });
          setOrders(ordersData || []);
          break;
        case 'bookings':
          const { data: bookingsData } = await supabase
            .from('coaching_appointments')
            .select('*')
            .order('created_at', { ascending: false });
          setBookings(bookingsData || []);
          break;
        case 'payments':
          const { data: paymentsData } = await supabase
            .from('coaching_orders')
            .select('*')
            .eq('payment_status', 'paid')
            .order('created_at', { ascending: false });
          setPayments(paymentsData || []);
          break;
      }
    } catch (error) {
      console.error(`Error fetching ${activeView}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    try {
      let error;
      switch (activeView) {
        case 'products':
          ({ error } = await supabase
            .from('coaching_products')
            .delete()
            .eq('id', id));
          break;
        case 'orders':
          ({ error } = await supabase
            .from('coaching_orders')
            .delete()
            .eq('id', id));
          break;
        case 'bookings':
          ({ error } = await supabase
            .from('coaching_appointments')
            .delete()
            .eq('id', id));
          break;
      }

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      let error;
      if (modalType === 'create') {
        switch (activeView) {
          case 'products':
            ({ error } = await supabase
              .from('coaching_products')
              .insert([data]));
            break;
          case 'orders':
            ({ error } = await supabase
              .from('coaching_orders')
              .insert([data]));
            break;
          case 'bookings':
            ({ error } = await supabase
              .from('coaching_appointments')
              .insert([data]));
            break;
          case 'payments':
            ({ error } = await supabase
              .from('coaching_orders')
              .insert([data]));
            break;
        }
      } else {
        switch (activeView) {
          case 'products':
            ({ error } = await supabase
              .from('coaching_products')
              .update(data)
              .eq('id', selectedItem.id));
            break;
          case 'orders':
            ({ error } = await supabase
              .from('coaching_orders')
              .update(data)
              .eq('id', selectedItem.id));
            break;
          case 'bookings':
            ({ error } = await supabase
              .from('coaching_appointments')
              .update(data)
              .eq('id', selectedItem.id));
            break;
          case 'payments':
            ({ error } = await supabase
              .from('coaching_orders')
              .update(data)
              .eq('id', selectedItem.id));
            break;
        }
      }

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error saving item:', error);
      throw error;
    }
  };

  const renderModal = () => {
    if (!showModal) return null;

    switch (activeView) {
      case 'products':
        return (
          <ProductModal
            type={modalType}
            product={selectedItem}
            onClose={() => setShowModal(false)}
            onSubmit={handleSubmit}
          />
        );
      case 'orders':
        return (
          <OrderModal
            type={modalType}
            order={selectedItem}
            onClose={() => setShowModal(false)}
            onSubmit={handleSubmit}
          />
        );
      case 'bookings':
        return (
          <BookingModal
            type={modalType}
            booking={selectedItem}
            onClose={() => setShowModal(false)}
            onSubmit={handleSubmit}
          />
        );
      case 'payments':
        return (
          <PaymentModal
            type={modalType}
            payment={selectedItem}
            onClose={() => setShowModal(false)}
            onSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coaching-primary"></div>
        </div>
      );
    }

    switch (activeView) {
      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={handleCreate}
                className="flex items-center px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Nouveau produit
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            product.type === 'digital'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {product.type === 'digital' ? 'Digital' : 'Physique'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {product.type === 'digital' ? '∞' : product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-coaching-primary hover:text-coaching-secondary mr-3"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      // Add similar table views for orders, bookings, and payments
      default:
        return null;
    }
  };

  return (
    <AnimatedSection>
      <div className="space-y-6">
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => setActiveView('products')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeView === 'products'
                ? 'bg-coaching-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Package size={20} className="mr-2" />
            Produits
          </button>
          <button
            onClick={() => setActiveView('orders')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeView === 'orders'
                ? 'bg-coaching-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ShoppingBag size={20} className="mr-2" />
            Commandes
          </button>
          <button
            onClick={() => setActiveView('bookings')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeView === 'bookings'
                ? 'bg-coaching-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar size={20} className="mr-2" />
            Réservations
          </button>
          <button
            onClick={() => setActiveView('payments')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              activeView === 'payments'
                ? 'bg-coaching-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CreditCard size={20} className="mr-2" />
            Paiements
          </button>
        </div>

        {renderContent()}
        {renderModal()}
      </div>
    </AnimatedSection>
  );
};

export default EcommerceManager;