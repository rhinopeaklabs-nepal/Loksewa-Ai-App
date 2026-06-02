import { useState, useEffect, useMemo } from "react";
import { Plus, Search, Pencil, Trash2, MoreHorizontal, Filter } from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { Card, CardHeader, CardBody } from "../components/ui/Card.jsx";
import { DataTable } from "../components/ui/DataTable.jsx";
import { Drawer } from "../components/ui/Drawer.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { FormField } from "../components/ui/FormField.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Input, Select } from "../components/ui/Input.jsx";

/**
 * Generic CRUD page. Pass:
 * - title, eyebrow, description
 * - columns: array of { key, label, render?, width? }
 * - fields: array of form field schemas
 * - items, load(), createItem(), updateItem(), deleteItem()
 * - filters: optional array of { key, label, options, value, onChange }
 * - searchPlaceholder, searchValue, onSearchChange
 * - emptyIcon
 */
export function CrudPage({
  title,
  eyebrow,
  description,
  columns,
  fields = [],
  items,
  loading,
  load,
  createItem,
  updateItem,
  deleteItem,
  filters = [],
  searchPlaceholder = "Search…",
  searchValue,
  onSearchChange,
  emptyIcon,
  emptyTitle = "No records yet",
  emptyDescription,
  onItemEdit, // optional, override edit form rendering
  transformBeforeSave
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(editing ? { ...editing } : buildEmpty(fields));
      setError("");
    }
  }, [open, editing, fields]);

  function buildEmpty(schema) {
    const out = {};
    for (const f of schema) out[f.name] = f.default ?? "";
    return out;
  }

  function startCreate() {
    setEditing(null);
    setOpen(true);
  }
  function startEdit(item) {
    setEditing(item);
    setOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = transformBeforeSave ? transformBeforeSave(form, editing) : form;
      if (editing) await updateItem(editing.id, payload);
      else await createItem(payload);
      setOpen(false);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      await deleteItem(confirmDelete.id);
      setConfirmDelete(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  const tableColumns = useMemo(() => {
    return [
      ...columns,
      {
        key: "__actions",
        label: "",
        width: "1%",
        render: (row) => (
          <div className="flex items-center gap-1 justify-end">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); startEdit(row); }} leftIcon={<Pencil className="w-3.5 h-3.5" />}>
              <span className="hidden xl:inline">Edit</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setConfirmDelete(row); }} leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}>
              <span className="hidden xl:inline text-rose-400">Delete</span>
            </Button>
          </div>
        )
      }
    ];
  }, [columns]);

  const itemsKey = items.length + "_" + (loading ? "1" : "0");

  return (
    <div className="flex flex-col gap-5 max-w-7xl">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          <Button onClick={startCreate} leftIcon={<Plus className="w-4 h-4" />}>
            New
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {onSearchChange && (
          <div className="relative flex-1 max-w-sm min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
        )}
        {filters.length > 0 && (
          <div className="flex items-center gap-2 text-zinc-500">
            <Filter className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-semibold">Filters</span>
          </div>
        )}
        {filters.map((f) => (
          <Select
            key={f.key}
            value={f.value || ""}
            onChange={(e) => f.onChange(e.target.value)}
            className="max-w-44"
          >
            <option value="">{f.placeholder || `All ${f.label}`}</option>
            {f.options.map((opt) => {
              const v = typeof opt === "string" ? opt : opt.value;
              const l = typeof opt === "string" ? opt : opt.label;
              return <option key={v} value={v}>{l}</option>;
            })}
          </Select>
        ))}
      </div>

      {/* Table or empty state */}
      {items.length === 0 && !loading ? (
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={<Button onClick={startCreate} leftIcon={<Plus className="w-4 h-4" />}>Create first</Button>}
        />
      ) : (
        <div key={itemsKey} className="anim-fade-in">
          <DataTable columns={tableColumns} rows={items} loading={loading} />
        </div>
      )}

      {/* Drawer for create/edit */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${title.toLowerCase().replace(/s$/, "")}` : `New ${title.toLowerCase().replace(/s$/, "")}`}
        description={editing ? "Update the details and save your changes." : "Fill in the details to add a new record."}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
            <Button onClick={handleSubmit} loading={busy}>
              {editing ? "Save changes" : "Create"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <FormField
              key={f.name}
              field={f}
              value={form[f.name]}
              onChange={(v) => setForm((s) => ({ ...s, [f.name]: v }))}
            />
          ))}
          {error && (
            <div className="md:col-span-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
              {error}
            </div>
          )}
        </form>
      </Drawer>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete this record?"
        message="This action can't be undone. The record will be removed permanently."
        confirmLabel="Delete"
        danger
        busy={busy}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
