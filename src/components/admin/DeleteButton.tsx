"use client";

interface DeleteButtonProps {
  action: (formData: FormData) => Promise<any>; 
  id: string;
  name: string;
  label: string;
}

export default function DeleteButton({ action, id, name, label }: DeleteButtonProps) {
  
  // Cette fonction wrappe l'action pour s'assurer que le confirm bloque l'exécution
  const handleAction = async (formData: FormData) => {
    if (confirm(`Voulez-vous vraiment supprimer "${label}" ?`)) {
      await action(formData);
    }
  };

  return (
    <form action={handleAction}>
      <input type="hidden" name={name} value={id} />
      <button 
        type="submit" 
        className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-all active:scale-95 font-bold flex items-center gap-1"
      >
        <span>🗑️</span> Supprimer
      </button>
    </form>
  );
}