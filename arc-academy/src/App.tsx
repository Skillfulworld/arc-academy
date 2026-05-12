import { useEffect, useRef } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";
import { LandingPage } from "@/pages/LandingPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { QuizPage } from "@/pages/QuizPage";
import { LeaderboardPage } from "@/pages/LeaderboardPage";
import { supabase } from "@/lib/supabase";
import { ensureUser, loadUserData } from "@/lib/db";
import { useAppStore } from "@/store/useAppStore";

export default function App() {
  const [, setLocation] = useLocation();
  const { connectEmail, disconnectEmail, loadFromDb, supabaseUserId } = useAppStore();
  const loadedRef = useRef<string | null>(null);

  async function handleSession(userId: string, email: string) {
    if (loadedRef.current === userId) return;
    loadedRef.current = userId;
    connectEmail(userId, email);
    await ensureUser(userId, email);
    const data = await loadUserData(userId);
    if (data) loadFromDb(data);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        handleSession(user.id, user.email ?? "");
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleSession(session.user.id, session.user.email ?? "");
      } else {
        loadedRef.current = null;
        disconnectEmail();
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function navigate(target: string) {
    if (target === "landing") setLocation("/");
    else if (target === "dashboard") setLocation("/dashboard");
    else setLocation(`/${target}`);
  }

  function startQuiz(quizId: string) {
    setLocation(`/quiz/${quizId}`);
  }

  return (
    <div className="min-h-screen">
      <Navbar onNavigate={navigate} />

      <Switch>
        <Route path="/">
          <LandingPage onNavigate={navigate} />
        </Route>
        <Route path="/dashboard">
          <DashboardPage onNavigate={navigate} onStartQuiz={startQuiz} />
        </Route>
        <Route path="/quiz/:id">
          {(params) => (
            <QuizPage quizId={params.id} onNavigate={navigate} />
          )}
        </Route>
        <Route path="/leaderboard">
          <LeaderboardPage />
        </Route>
        <Route>
          <LandingPage onNavigate={navigate} />
        </Route>
      </Switch>
    </div>
  );
}
