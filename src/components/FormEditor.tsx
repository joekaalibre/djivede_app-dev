import React, { useState } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  conditions?: {
    show?: {
      field: string;
      operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
      value: string;
    }[];
    actions?: {
      type: 'goToQuestion' | 'showMessage' | 'endForm' | 'redirect' | 'sendEmail';
      value: string;
      targetQuestion?: string;
      when: {
        operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
        value: string;
      };
    }[];
  };
  endMessage?: string;
}

interface FormEditorProps {
  form: {
    id: string;
    title: string;
    description: string | null;
    fields: FormField[];
  };
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const fieldTypes = [
  { value: 'text', label: 'Texte court' },
  { value: 'textarea', label: 'Texte long' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Téléphone' },
  { value: 'number', label: 'Nombre' },
  { value: 'select', label: 'Liste déroulante' },
  { value: 'radio', label: 'Boutons radio' },
  { value: 'checkbox', label: 'Cases à cocher' }
];

const operators = [
  { value: 'equals', label: 'Est égal à' },
  { value: 'notEquals', label: 'Est différent de' },
  { value: 'contains', label: 'Contient' },
  { value: 'greaterThan', label: 'Est supérieur à' },
  { value: 'lessThan', label: 'Est inférieur à' }
];

const actionTypes = [
  { value: 'goToQuestion', label: 'Aller à la question' },
  { value: 'showMessage', label: 'Afficher un message' },
  { value: 'endForm', label: 'Terminer le formulaire' },
  { value: 'redirect', label: 'Rediriger vers une URL' },
  { value: 'sendEmail', label: 'Envoyer un email' }
];

const SortableField = ({ field, fields, onUpdate, onDelete }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddCondition = () => {
    const newConditions = field.conditions || {};
    newConditions.show = newConditions.show || [];
    newConditions.show.push({
      field: '',
      operator: 'equals',
      value: ''
    });
    onUpdate(field.id, { ...field, conditions: newConditions });
  };

  const handleAddAction = () => {
    const newConditions = field.conditions || {};
    newConditions.actions = newConditions.actions || [];
    newConditions.actions.push({
      type: 'showMessage',
      value: '',
      when: {
        operator: 'equals',
        value: ''
      }
    });
    onUpdate(field.id, { ...field, conditions: newConditions });
  };

  const handleRemoveCondition = (index: number) => {
    const newConditions = { ...field.conditions };
    newConditions.show.splice(index, 1);
    if (newConditions.show.length === 0) delete newConditions.show;
    onUpdate(field.id, { ...field, conditions: newConditions });
  };

  const handleRemoveAction = (index: number) => {
    const newConditions = { ...field.conditions };
    newConditions.actions.splice(index, 1);
    if (newConditions.actions.length === 0) delete newConditions.actions;
    onUpdate(field.id, { ...field, conditions: newConditions });
  };

  const handleUpdateCondition = (index: number, updates: any) => {
    const newConditions = { ...field.conditions };
    newConditions.show[index] = { ...newConditions.show[index], ...updates };
    onUpdate(field.id, { ...field, conditions: newConditions });
  };

  const handleUpdateAction = (index: number, updates: any) => {
    const newConditions = { ...field.conditions };
    newConditions.actions[index] = { ...newConditions.actions[index], ...updates };
    onUpdate(field.id, { ...field, conditions: newConditions });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg border p-4 mb-4"
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de champ
            </label>
            <select
              value={field.type}
              onChange={(e) => onUpdate(field.id, { ...field, type: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
            >
              {fieldTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate(field.id, { ...field, label: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
            />
          </div>

          {field.type !== 'checkbox' && field.type !== 'radio' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => onUpdate(field.id, { ...field, placeholder: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              />
            </div>
          )}

          {field.type === 'number' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valeur minimum
                </label>
                <input
                  type="number"
                  value={field.validation?.min || ''}
                  onChange={(e) => onUpdate(field.id, {
                    ...field,
                    validation: {
                      ...field.validation,
                      min: e.target.value ? Number(e.target.value) : undefined
                    }
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valeur maximum
                </label>
                <input
                  type="number"
                  value={field.validation?.max || ''}
                  onChange={(e) => onUpdate(field.id, {
                    ...field,
                    validation: {
                      ...field.validation,
                      max: e.target.value ? Number(e.target.value) : undefined
                    }
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          {field.type === 'tel' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format (ex: +XXX XXXXXXXXX)
              </label>
              <input
                type="text"
                value={field.validation?.pattern || ''}
                onChange={(e) => onUpdate(field.id, {
                  ...field,
                  validation: {
                    ...field.validation,
                    pattern: e.target.value
                  }
                })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                placeholder="+XXX XXXXXXXXX"
              />
            </div>
          )}

          {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (une par ligne)
              </label>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  {field.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(field.options || [])];
                          newOptions[index] = e.target.value;
                          onUpdate(field.id, { ...field, options: newOptions });
                        }}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                        placeholder={`Option ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newOptions = field.options?.filter((_, i) => i !== index) || [];
                          onUpdate(field.id, { ...field, options: newOptions });
                        }}
                        className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    const newOptions = [...(field.options || []), ''];
                    onUpdate(field.id, { ...field, options: newOptions });
                  }}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-coaching-primary hover:border-coaching-primary transition-colors"
                >
                  + Ajouter une option
                </button>

                <div className="text-sm text-gray-500">
                  <p className="mb-1">
                    {field.type === 'radio' && "L'utilisateur pourra sélectionner une seule option"}
                    {field.type === 'checkbox' && "L'utilisateur pourra sélectionner plusieurs options"}
                    {field.type === 'select' && "L'utilisateur pourra sélectionner une option dans la liste"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Conditions de visibilité */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Conditions d'affichage
              </label>
              <button
                type="button"
                onClick={handleAddCondition}
                className="text-sm text-coaching-primary hover:text-coaching-secondary"
              >
                + Ajouter une condition
              </button>
            </div>
            {field.conditions?.show?.map((condition, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <select
                  value={condition.field}
                  onChange={(e) => handleUpdateCondition(index, { field: e.target.value })}
                  className="flex-1 px-3 py-1 border rounded focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                >
                  <option value="">Sélectionner un champ</option>
                  {fields.filter(f => f.id !== field.id).map((f: FormField) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
                <select
                  value={condition.operator}
                  onChange={(e) => handleUpdateCondition(index, { operator: e.target.value })}
                  className="flex-1 px-3 py-1 border rounded focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                >
                  {operators.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={condition.value}
                  onChange={(e) => handleUpdateCondition(index, { value: e.target.value })}
                  placeholder="Valeur"
                  className="flex-1 px-3 py-1 border rounded focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCondition(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Actions conditionnelles */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Actions conditionnelles
              </label>
              <button
                type="button"
                onClick={handleAddAction}
                className="text-sm text-coaching-primary hover:text-coaching-secondary"
              >
                + Ajouter une action
              </button>
            </div>
            {field.conditions?.actions?.map((action, index) => (
              <div key={index} className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <select
                    value={action.type}
                    onChange={(e) => handleUpdateAction(index, { type: e.target.value })}
                    className="flex-1 px-3 py-1 border rounded focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  >
                    {actionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveAction(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {action.type === 'goToQuestion' && (
                  <select
                    value={action.targetQuestion || ''}
                    onChange={(e) => handleUpdateAction(index, { targetQuestion: e.target.value })}
                    className="w-full px-3 py-1 border rounded focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  >
                    <option value="">Sélectionner une question</option>
                    {fields.filter((f: FormField) => f.id !== field.id).map((f: FormField) => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                )}

                {(action.type === 'showMessage' || action.type === 'endForm') && (
                  <textarea
                    value={action.value}
                    onChange={(e) => handleUpdateAction(index, { value: e.target.value })}
                    placeholder={
                      action.type === 'showMessage' ? 'Message à afficher' :
                      'Message de fin de formulaire'
                    }
                    rows={3}
                    className="w-full px-3 py-1 border rounded focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  />
                )}

                {action.type === 'redirect' && (
                  <input
                    type="url"
                    value={action.value}
                    onChange={(e) => handleUpdateAction(index, { value: e.target.value })}
                    placeholder="URL de redirection"
                    className="w-full px-3 py-1 border rounded focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  />
                )}

                {action.type === 'sendEmail' && (
                  <div className="space-y-2">
                    <input
                      type="email"
                      value={action.value}
                      onChange={(e) => handleUpdateAction(index, { value: e.target.value })}
                      placeholder="Adresse email"
                      className="w-full px-3 py-1 border rounded focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                    />
                    <textarea
                      value={action.emailContent || ''}
                      onChange={(e) => handleUpdateAction(index, { emailContent: e.target.value })}
                      placeholder="Contenu de l'email"
                      rows={3}
                      className="w-full px-3 py-1 border rounded focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Quand la réponse</span>
                  <select
                    value={action.when.operator}
                    onChange={(e) => handleUpdateAction(index, { when: { ...action.when, operator: e.target.value } })}
                    className="flex-1 px-3 py-1 border rounded focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  >
                    {operators.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={action.when.value}
                    onChange={(e) => handleUpdateAction(index, { when: { ...action.when, value: e.target.value } })}
                    placeholder="Valeur"
                    className="flex-1 px-3 py-1 border rounded focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Message de fin de formulaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message de fin de formulaire
            </label>
            <textarea
              value={field.endMessage || ''}
              onChange={(e) => onUpdate(field.id, { ...field, endMessage: e.target.value })}
              placeholder="Message à afficher si c'est la dernière question"
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => onUpdate(field.id, { ...field, required: e.target.checked })}
                className="text-coaching-primary focus:ring-coaching-primary rounded"
              />
              <span className="text-sm text-gray-700">Champ obligatoire</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <button
            {...attributes}
            {...listeners}
            className="p-2 text-gray-400 hover:text-gray-600 cursor-move"
            title="Déplacer"
          >
            ⋮⋮
          </button>
          <button
            onClick={() => onDelete(field.id)}
            className="p-2 text-red-400 hover:text-red-600"
            title="Supprimer"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const FormEditor: React.FC<FormEditorProps> = ({ form, onClose, onSave }) => {
  const [formData, setFormData] = useState(form);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFieldUpdate = (fieldId: string, updatedField: FormField) => {
    setFormData({
      ...formData,
      fields: formData.fields.map(field =>
        field.id === fieldId ? updatedField : field
      ),
    });
  };

  const handleFieldDelete = (fieldId: string) => {
    setFormData({
      ...formData,
      fields: formData.fields.filter(field => field.id !== fieldId),
    });
  };

  const handleAddField = () => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type: 'text',
      label: 'Nouveau champ',
      required: false,
      placeholder: '',
    };

    setFormData({
      ...formData,
      fields: [...formData.fields, newField],
    });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setFormData((form) => {
        const oldIndex = form.fields.findIndex((field) => field.id === active.id);
        const newIndex = form.fields.findIndex((field) => field.id === over.id);

        const newFields = [...form.fields];
        const [removed] = newFields.splice(oldIndex, 1);
        newFields.splice(newIndex, 0, removed);

        return {
          ...form,
          fields: newFields,
        };
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving form:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto">
      <div className="relative my-8 mx-auto w-full max-w-4xl bg-white rounded-xl shadow-xl">
        <div className="sticky top-0 z-10 bg-white p-6 border-b flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold">Modifier le formulaire</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre du formulaire
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Champs du formulaire</h3>
                <button
                  type="button"
                  onClick={handleAddField}
                  className="flex items-center px-4 py-2 text-sm bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors"
                >
                  <Plus size={16} className="mr-2" />
                  Ajouter un champ
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={formData.fields.map(f => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {formData.fields.map((field) => (
                    <SortableField
                      key={field.id}
                      field={field}
                      fields={formData.fields}
                      onUpdate={handleFieldUpdate}
                      onDelete={handleFieldDelete}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormEditor;