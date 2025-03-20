import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";

// Pages
import Dashboard from "@/pages/dashboard";
import BasePage from "@/pages/base";
import WorkshopPage from "@/pages/workshop";
import EquipmentTypePage from "@/pages/equipment-type";
import EquipmentPage from "@/pages/equipment";
import ComponentPage from "@/pages/component";
import SparePartPage from "@/pages/spare-part";
import SupplierPage from "@/pages/supplier";
import AssociationPage from "@/pages/association";
import QueryPage from "@/pages/query";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/" component={Dashboard} />
        <Route path="/base" component={BasePage} />
        <Route path="/workshop" component={WorkshopPage} />
        <Route path="/equipment-type" component={EquipmentTypePage} />
        <Route path="/equipment" component={EquipmentPage} />
        <Route path="/component" component={ComponentPage} />
        <Route path="/spare-part" component={SparePartPage} />
        <Route path="/supplier" component={SupplierPage} />
        <Route path="/association" component={AssociationPage} />
        <Route path="/query" component={QueryPage} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
