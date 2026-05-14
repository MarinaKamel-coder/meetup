"use client";

interface DeleteButtonProps {
  // L'action attend maintenant une string (l'ID)
  action: (id: string) => Promise<any>; 
  id: string;
  label: string;
}

export default function DeleteButton({ action, id, label }: DeleteButtonProps) {
  
  const handleAction = async () => {
    if (confirm(`Voulez-vous vraiment supprimer "${label}" ?`)) {
      const result = await action(id);
      
      if (result?.error) {
        alert(result.error);
      }
    }
  };

  return (
    <button 
      type="button" 
      onClick={handleAction}
      className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-all active:scale-95 font-bold flex items-center gap-1"
    >
      <span>🗑️</span> Supprimer
    </button>
  );
}