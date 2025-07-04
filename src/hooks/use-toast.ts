"use client";

import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

// Constantes ajustadas para el juego
const LIMITE_TOASTS = 1; // Solo 1 toast visible (ideal para notificaciones críticas)
const RETRASO_ELIMINACION = 1_000_000; // 1 segundo = 1,000 ms (toasts persistentes)

type ToastJuego = ToastProps & {
  id: string;
  titulo?: React.ReactNode;
  descripcion?: React.ReactNode;
  accion?: ToastActionElement;
};

// Generador de IDs mejorado (usa crypto si está disponible)
function generarId() {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2, 9);
}

// Estado inicial y listeners
let estadoInicial: EstadoToast = { toasts: [] };
const listeners: Array<(state: EstadoToast) => void> = [];
const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

// Reductor con seguridad de tipos
function reductor(state: EstadoToast, action: AccionToast): EstadoToast {
  switch (action.type) {
    case "AGREGAR_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, LIMITE_TOASTS),
      };

    case "ACTUALIZAR_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DESCARTAR_TOAST":
      if (action.toastId) {
        agregarAColaEliminacion(action.toastId);
      } else {
        state.toasts.forEach((t) => agregarAColaEliminacion(t.id));
      }
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId || action.toastId === undefined
            ? { ...t, open: false }
            : t
        ),
      };

    case "ELIMINAR_TOAST":
      return {
        ...state,
        toasts: action.toastId === undefined
          ? []
          : state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
}

// Dispatch para actualizar estado
function dispatch(action: AccionToast) {
  estadoInicial = reductor(estadoInicial, action);
  listeners.forEach((listener) => listener(estadoInicial));
}

// Función para manejar la eliminación retardada
function agregarAColaEliminacion(toastId: string) {
  if (timeouts.has(toastId)) return;

  const timeout = setTimeout(() => {
    timeouts.delete(toastId);
    dispatch({ type: "ELIMINAR_TOAST", toastId });
  }, RETRASO_ELIMINACION);

  timeouts.set(toastId, timeout);
}

// API Pública
export function toast({ ...props }: Omit<ToastJuego, "id">) {
  const id = generarId();

  const actualizar = (props: Partial<ToastJuego>) =>
    dispatch({ type: "ACTUALIZAR_TOAST", toast: { ...props, id } });

  const descartar = () => dispatch({ type: "DESCARTAR_TOAST", toastId: id });

  dispatch({
    type: "AGREGAR_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => !open && descartar(),
    },
  });

  return { id, descartar, actualizar };
}

// Hook para usar en componentes
export function useToast() {
  const [state, setState] = React.useState<EstadoToast>(estadoInicial);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    descartar: (toastId?: string) => dispatch({ type: "DESCARTAR_TOAST", toastId }),
  };
}

// Tipos
type AccionToast =
  | { type: "AGREGAR_TOAST"; toast: ToastJuego }
  | { type: "ACTUALIZAR_TOAST"; toast: Partial<ToastJuego> }
  | { type: "DESCARTAR_TOAST"; toastId?: string }
  | { type: "ELIMINAR_TOAST"; toastId?: string };

interface EstadoToast {
  toasts: ToastJuego[];
}