# MCP-01jm — Conector MCP para preguntarle a Claude o ChatGPT por mis finanzas

## Objetivo
Poder preguntar desde Claude o ChatGPT cosas como "¿en qué he gastado más este mes?" y que la
respuesta salga de mis datos reales de MyPayTracker, sin abrir la app.

## Requisitos de usuario
1. Agrego la URL del conector en Claude o ChatGPT y me pide iniciar sesión con mi cuenta de la app.
2. Veo una pantalla de la app que dice qué aplicación pide acceso y puedo aprobar o rechazar.
3. Al aprobar, el asistente puede consultar: resumen de un mes (ingresos, gastos, neto y en qué
   comercios gasté más) y la lista de movimientos de un rango de fechas.
4. El asistente solo ve mis datos; nunca los de otro usuario.

## Restricciones críticas
- Solo lectura: el conector no crea, edita ni borra nada.
- Los datos se leen como el usuario que aprobó (RLS), nunca con `service_role`.
- Montos en centavos enteros internamente; CRC y USD nunca se suman entre sí.
- Meses en hora de Costa Rica, igual que el Resumen de la app.
- Ningún secreto nuevo en git; cambios remotos (activar OAuth, desplegar) los hace el dev.

## Criterios de aceptación
- AC-1: sin token o con token inválido el conector responde 401 indicando dónde autenticarse.
- AC-2: `resumen_mes` devuelve lo mismo que muestra el Resumen de la app para ese mes (CRC).
- AC-3: `movimientos` devuelve como máximo 200 movimientos del rango, con moneda en cada uno.
- AC-4: la pantalla de consentimiento muestra el nombre del cliente y permite aprobar o rechazar;
  si no hay sesión, pide login primero y luego sigue con el consentimiento.
- AC-5: un mes o fecha mal escritos devuelven un error claro, no una excepción.

## Supuestos (decididos sin preguntar, criterio conservador)
- Autenticación con el servidor OAuth 2.1 de Supabase Auth (registro dinámico de clientes), que
  es lo que Claude y ChatGPT esperan; la pantalla de consentimiento vive en `/oauth/consent`.
- Solo dos herramientas de lectura; "¿puedo comprar esto?" y escribir movimientos quedan fuera.
- "Comercio" = descripción tal cual, como `topExpenses` en el Resumen. USD aparece solo en
  `movimientos`, sin convertir.
- No existe `docs/mapa-de-la-app.md`; se siguió `docs/constitution.md` y el código actual.
