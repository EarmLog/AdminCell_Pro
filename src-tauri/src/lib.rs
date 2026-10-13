// ============================================================================
//  Punto de entrada de la aplicación de escritorio (Tauri 2).
//  Registra el plugin SQL (SQLite) que usa la capa de datos local.
// ============================================================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error al ejecutar AdminCell Pro");
}
