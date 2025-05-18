import { Route, Routes } from "react-router-dom";

import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import { SideBarNav } from "./components/SideBarNav";
import TeachersPage from "./pages/TeachersPage";
import SubjectsPage from "./pages/SubjectsPage";
import StudentsPage from "./pages/StudentsPage";
import GroupsPage from "./pages/GroupsPage";
import UserProfile from "./pages/UserProfile";
import ChatsPage from "./pages/ChatsPage";
import EventsPage from "./pages/EventsPage";
import SubjectPage from "./pages/SubjectPage";
import MessageList from "./components/MessageList";

function Router() {
  return (
    <Routes>
      {/* <Route path="/homepage" element={<HomePage />} /> */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/homepage" element={<SideBarNav />}>
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="subjects" element={<SubjectsPage />}></Route>
        <Route path="subjects/:id" element={<SubjectPage />}></Route>
        <Route path="events" element={<EventsPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="groups" element={<GroupsPage />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="chats" element={<ChatsPage />}>
          <Route path=":id" element={<MessageList />} />
        </Route>
      </Route>
    </Routes>
  );
}
export default Router;
