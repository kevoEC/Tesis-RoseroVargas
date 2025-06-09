import{j as e,L as i}from"./index-CG6H-kfp.js";import{S as n}from"./switch-f3LOaz4k.js";import"./index-DMmKv1VD.js";function o(){return e.jsxs("div",{className:"p-6 space-y-6",children:[e.jsx("header",{className:"flex flex-col lg:flex-row justify-between items-start lg:items-center border-b pb-4",children:e.jsx("div",{children:e.jsx("h1",{className:"text-2xl font-semibold text-gray-800",children:"Pagos 10/5/2025"})})}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-6",children:[e.jsxs("div",{className:"lg:col-span-1 space-y-6",children:[e.jsx("section",{className:"bg-white shadow rounded-lg p-6 space-y-4",children:e.jsxs("div",{children:[e.jsxs("label",{className:"block text-sm font-medium mb-1",children:["Calendario de pagos ",e.jsx("span",{className:"text-red-500",children:"*"})]}),e.jsxs("select",{className:"w-full border rounded-md p-2 bg-white",children:[e.jsx("option",{children:"— Selecciona calendario —"}),e.jsx("option",{children:"10 MAYO 2025"}),e.jsx("option",{children:"20 MAYO 2025"})]})]})}),e.jsxs("section",{className:"bg-white shadow rounded-lg p-6 space-y-4",children:[e.jsx("h2",{className:"text-lg font-semibold",children:"Opciones"}),e.jsxs("div",{className:"space-y-3",children:[["Generar casos de pago","Confirmar registros de pago","Confirmar pagos cargados en Banco"].map(s=>e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-sm",children:s}),e.jsx("label",{className:"inline-flex items-center cursor-not-allowed",children:e.jsx(l,{})})]},s)),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium mb-1",children:"Detalles"}),e.jsx("textarea",{className:"w-full border rounded-md p-2",rows:"3",placeholder:"---"})]})]})]})]}),e.jsx("aside",{className:"lg:col-span-2",children:e.jsxs("section",{className:"bg-white shadow rounded-lg p-6 space-y-6",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4 items-center",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium mb-1",children:"Cantidad de pagos"}),e.jsx("input",{type:"text",readOnly:!0,defaultValue:"87",className:"w-full border rounded-md p-2 bg-gray-100"})]}),e.jsxs("div",{className:"md:col-span-2 flex items-center space-x-3",children:[e.jsx("label",{className:"block text-sm font-medium",children:"Descartar pagos"}),e.jsx("label",{className:"inline-flex items-center cursor-pointer",children:e.jsx(l,{})})]})]}),e.jsx("div",{className:"space-y-4",children:e.jsx("div",{className:"flex items-center justify-between",children:e.jsx("h3",{className:"text-md font-semibold",children:"Casos de pago"})})})]})})]})]})}function l({label:s,checked:a,onChange:r}){return e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs("div",{className:"relative",children:[e.jsx(n,{checked:a,onCheckedChange:r,className:`
            peer
            inline-flex
            h-6 w-11 shrink-0
            cursor-pointer
            items-center
            rounded-full
            border
            border-black
            transition-colors
            duration-200
            ease-in-out
            ${a?"bg-primary":"bg-gray-300"}
          `}),e.jsx("span",{className:`
            pointer-events-none
            absolute
            left-0.5 top-0.5
            h-5 w-5
            transform
            rounded-full
            bg-white
            shadow
            transition-transform
            duration-200
            ease-in-out
            ${a?"translate-x-5":"translate-x-0"}
          `})]}),e.jsx(i,{className:"text-sm font-medium text-gray-700",children:s})]})}export{o as default};
