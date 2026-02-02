import { Routes,Route, Navigate } from "react-router"
import HomePage from "./pages/HomePage"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Admin from "./pages/Admin"
import { checkAuth } from "./slices/authSlice"  // this checkAuth will come with its slice 
import { useDispatch,useSelector } from "react-redux"
import { useEffect } from "react"
import ProblemPage from "./pages/ProblemPage"
import AdminPanel from "./components/AdminPanel"
import AdminDelete from "./components/AdminDelete"
import AdminUpdate from "./components/AdminUpdate"
import AdminVideo from "./components/AdminVideo"
import AdminUpload from "./components/AdminUpload"
import Update from "./pages/update"
function App(){

  //for every api call we will check if user is authenticated or not
  const {isAuthenticated,loading,user}=useSelector((state)=> state.auth);
  //state here  is a global object that contain all slices variables
  const dispatch = useDispatch();
  useEffect(()=>{
    dispatch(checkAuth());
  },[dispatch])// we want a constant value in it , as it should be run one

  if(loading){
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  }
 return(
    <>
    <Routes>
      <Route path="/" element={isAuthenticated?<HomePage></HomePage>:<Navigate to="/signup"/>}></Route>
      <Route path="/login" element={isAuthenticated?<Navigate to="/"></Navigate>:<Login></Login>}></Route>
      <Route path="/signup" element={isAuthenticated?<Navigate to="/"></Navigate>:<Signup></Signup>}></Route>
      <Route path="problem/:problemId" element={<ProblemPage></ProblemPage>}></Route>
      <Route path="/admin"
      element={isAuthenticated && user?.role==='admin'?
      <Admin/>:
      <Navigate to="/"></Navigate>
      }
      >
      </Route>
      <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
      <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />
      <Route path="/admin/update" element={isAuthenticated && user?.role === 'admin' ? <Update /> : <Navigate to="/" />} />
      <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />
      <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />} />
      <Route path="/admin/update/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpdate /> : <Navigate to="/" />} />
    </Routes>
    </>
  )
}

export default App