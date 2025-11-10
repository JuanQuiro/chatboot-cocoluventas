use leptos::*;
use leptos_meta::*;
use leptos_router::*;

mod api;
mod components;
mod pages;
mod state;
mod utils;

use components::layout::Layout;
use pages::{
    Dashboard, Bots, Products, Orders, Customers, Sellers, 
    Conversations, Analytics, Settings, Login, NotFound
};

#[component]
pub fn App() -> impl IntoView {
    provide_meta_context();

    view! {
        <Stylesheet id="leptos" href="/pkg/dashoffice-frontend.css"/>
        <Link rel="icon" type_="image/ico" href="/favicon.ico"/>
        <Meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <Title text="DashOffice - Sistema Empresarial"/>

        <Router>
            <Routes>
                <Route path="/" view=Layout>
                    <Route path="" view=Dashboard/>
                    <Route path="bots" view=Bots/>
                    <Route path="products" view=Products/>
                    <Route path="orders" view=Orders/>
                    <Route path="customers" view=Customers/>
                    <Route path="sellers" view=Sellers/>
                    <Route path="analytics" view=Analytics/>
                    <Route path="conversations" view=Conversations/>
                    <Route path="settings" view=Settings/>
                    <Route path="/*any" view=NotFound/>
                </Route>
                <Route path="/login" view=Login/>
            </Routes>
        </Router>
    }
}

#[wasm_bindgen::prelude::wasm_bindgen]
pub fn hydrate() {
    console_error_panic_hook::set_once();
    tracing_wasm::set_as_global_default();
    
    leptos::mount_to_body(|| {
        view! { <App/> }
    });
}
