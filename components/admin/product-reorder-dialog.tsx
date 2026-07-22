"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  adminListProductsByCategory,
  adminReorderProducts,
  type ReorderableProduct,
} from "@/app/actions/admin";

function SortableRow({ product }: { product: ReorderableProduct }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border border-hairline bg-surface px-3 py-2 ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none px-1 text-ink-soft active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
          <circle cx="5" cy="4" r="1.2" />
          <circle cx="11" cy="4" r="1.2" />
          <circle cx="5" cy="8" r="1.2" />
          <circle cx="11" cy="8" r="1.2" />
          <circle cx="5" cy="12" r="1.2" />
          <circle cx="11" cy="12" r="1.2" />
        </svg>
      </button>
      <div className="aspect-square w-10 shrink-0 overflow-hidden rounded-md border border-hairline bg-tint">
        {product.image && (
          <img src={product.image} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <span className="flex-1 text-sm font-medium text-ink">{product.name}</span>
    </li>
  );
}

export function ProductReorderDialog({
  categoryId,
  categoryName,
  open,
  onOpenChange,
}: {
  categoryId: number | null;
  categoryName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [products, setProducts] = useState<ReorderableProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => {
    if (!open || categoryId === null) return;
    setLoading(true);
    adminListProductsByCategory(categoryId)
      .then(setProducts)
      .catch(() => toast.error("Could not load products."))
      .finally(() => setLoading(false));
  }, [open, categoryId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || categoryId === null) return;

    setProducts((current) => {
      const oldIndex = current.findIndex((p) => p.id === active.id);
      const newIndex = current.findIndex((p) => p.id === over.id);
      const reordered = arrayMove(current, oldIndex, newIndex);
      startTransition(() => {
        adminReorderProducts({
          categoryId,
          orderedProductIds: reordered.map((p) => p.id),
        }).catch(() => toast.error("Could not save the new order."));
      });
      return reordered;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto border-hairline bg-paper text-ink sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold tracking-tight">
            Reorder {categoryName}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-ink-soft">
          Drag products to change the order they appear in on the storefront.
        </p>
        {loading ? (
          <p className="py-8 text-center text-sm text-ink-soft">Loading...</p>
        ) : products.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-soft">No products in this category yet.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              <ul className="mt-2 flex flex-col gap-2">
                {products.map((p) => (
                  <SortableRow key={p.id} product={p} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </DialogContent>
    </Dialog>
  );
}
