import {
  TextField,
  Checkbox,
  FormHelperText,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import React from "react"; // Import React for React.memo

const FormField = React.memo(function FormField({
  type = "text",
  name,
  label,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder,
  fullWidth = true,
  variant = "outlined",
  className = "",
  unit,
  multiline = false,
  options, // Extract options to prevent passing to TextField
  labels, // Extract labels to prevent passing to TextField
  ...props
}) {
  if (type === "checkbox") {
    const checkboxId = `checkbox-${name}`;
    return (
      <div className={`flex items-center  ${className}`}>
        <Checkbox
          id={checkboxId}
          name={name}
          checked={value || false}
          onChange={onChange}
          disabled={disabled}
          color="primary"
          className="mt-1"
          {...props}
        />
        <div className="flex flex-col">
          <label
            htmlFor={checkboxId}
            className="text-sm font-medium text-gray-700 cursor-pointer"
          >
            {label || name}
          </label>
          {helperText &&
            !error &&
            helperText !== false &&
            helperText !== "" && (
              <FormHelperText className="mt-0 text-xs text-gray-500">
                {helperText}
              </FormHelperText>
            )}
          {error && (
            <FormHelperText error className="mt-0">
              {error}
            </FormHelperText>
          )}
        </div>
      </div>
    );
  } else if (type === "select") {
    return (
      <div className={className}>
        <FormControl fullWidth size="small">
          <InputLabel id="demo-simple-select-label ">{label}</InputLabel>
          <Select
            name={name}
            value={value || ""}
            onChange={onChange}
            disabled={disabled}
            required={required}
            {...props}
          >
            {options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.color && (
                  <div
                    className="w-3 h-3 rounded-full mr-2 inline-block"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                {option.label || option.value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    );
  }

  return (
    <div className={className}>
      <TextField
        type={type}
        name={name}
        label={label}
        value={
          type === "date" && typeof value === "string"
            ? value.split("T")[0]
            : value || ""
        }
        onChange={onChange}
        error={!!error}
        helperText={error || helperText}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        fullWidth={fullWidth}
        size="small"
        variant={variant}
        multiline={multiline}
        InputLabelProps={type === "date" ? { shrink: true } : undefined}
        InputProps={{
          onWheel:
            type === "number"
              ? (e) => e.target.blur() // 👈 disables scroll-change
              : undefined,
          endAdornment: unit && (
            <InputAdornment position="end">{unit}</InputAdornment>
          ),
        }}
        inputProps={{
          style: {
            MozAppearance: "textfield",
            WebkitAppearance: "none",
            margin: 0,
          },
          readOnly: props.readOnly,
          list: type === "list" ? name : undefined,
          ...props.inputProps,
        }}
        {...props}
          sx={{
    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
      display: 'none',
    },
    '& input': {
      MozAppearance: 'textfield',
      appearance: 'textfield',
    },
  }}
      />

      {type === "list" && (
        <datalist id={name}>
          {labels?.map((label) => (
            <option key={label} value={label} />
          ))}
        </datalist>
      )}
    </div>
  );
});

export default FormField;
