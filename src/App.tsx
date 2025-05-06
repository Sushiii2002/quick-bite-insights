
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PrivateRoute from "@/components/auth/PrivateRoute";

// Pages
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import FoodImage from "@/pages/FoodImage";
import AnalysisReports from "@/pages/AnalysisReports";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import AIChat from "@/pages/AIChat";
import NotFound from "@/pages/NotFound";

// Styles
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/ai-chat" element={<PrivateRoute><AIChat /></PrivateRoute>} />
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
            <Route path="/food-image" element={<PrivateRoute><FoodImage /></PrivateRoute>} />
            <Route path="/analysis" element={<PrivateRoute><AnalysisReports /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
