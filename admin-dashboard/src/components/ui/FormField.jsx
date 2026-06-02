// Helper to render a field cell from a schema
import { Input, Textarea, Select, Field } from "./Input.jsx";

export function FormField({ field, value, onChange }) {
  const handle = (v) => onChange?.(v);
  let control;
  if (field.type === "textarea") {
    control = <Textarea value={value ?? ""} onChange={(e) => handle(e.target.value)} rows={field.rows || 3} placeholder={field.placeholder} />;
  } else if (field.type === "select") {
    control = (
      <Select value={value ?? ""} onChange={(e) => handle(e.target.value)}>
        {field.placeholder && <option value="">{field.placeholder}</option>}
        {field.options.map((opt) => {
          const v = typeof opt === "string" ? opt : opt.value;
          const l = typeof opt === "string" ? opt : opt.label;
          return <option key={v} value={v}>{l}</option>;
        })}
      </Select>
    );
  } else if (field.type === "color") {
    control = <Input type="color" value={value ?? "#000000"} onChange={(e) => handle(e.target.value)} className="h-10 w-20 cursor-pointer" />;
  } else if (field.type === "number") {
    control = <Input type="number" step={field.step} value={value ?? ""} onChange={(e) => handle(e.target.value)} placeholder={field.placeholder} />;
  } else if (field.type === "password") {
    control = <Input type="password" value={value ?? ""} onChange={(e) => handle(e.target.value)} placeholder={field.placeholder} />;
  } else {
    control = <Input type={field.type || "text"} value={value ?? ""} onChange={(e) => handle(e.target.value)} placeholder={field.placeholder} />;
  }

  if (field.noLabel) return control;
  return (
    <Field label={field.label} required={field.required} hint={field.hint} className={field.wide ? "md:col-span-2" : undefined}>
      {control}
    </Field>
  );
}
