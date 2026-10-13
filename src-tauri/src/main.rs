// En Windows, evita que se abra una consola junto a la ventana en la versión final.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    admincell_pro_lib::run()
}
