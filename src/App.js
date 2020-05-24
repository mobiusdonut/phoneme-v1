import React, {useState, createContext, useContext} from "react";
import {BrowserRouter as Router, Switch, Route, Link, useParams, useLocation, useRouteMatch, useHistory} from "react-router-dom";
import {Helmet} from 'react-helmet'
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import firebase from './firebase.js';
import ReactHtmlParser from 'react-html-parser';

const auth = firebase.auth();
const db = firebase.firestore();
const storageRef = firebase.storage().ref();
const UserContext = createContext({
  userEmail: 'paused',
  userInfo: {name: ''},
  setAllInfo: () => {},
});
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

export default function Page() {
  const [userEmail, setEmail] = useState('');
  const [userInfo, setInfo] = useState({name: '', position: ''});
  var users = []
  const setAllInfo = (email) => {
    const ref = db.collection('users').where("email", "==", email);
    ref.get().then((querySnapshot) => {
      querySnapshot.forEach(function (doc) {
        users.push(doc.data());
      });
      if (users[0]) {
        setInfo(users[0]);
      }
    });
    setEmail(email)
  };
  return (
    <UserContext.Provider value={{
          userEmail,
          userInfo,
          setAllInfo,
        }}>
      <Router>
        <div>
          <div id="topper">
            <Link to="/"><img id="header" src="https://firebasestorage.googleapis.com/v0/b/ihsvoice-f70bd.appspot.com/o/voice.png?alt=media&token=a64989d2-35af-4a1c-95bd-b9baf39fe180" alt=""></img></Link>
            <hr />
            <Navbar />
          </div>

          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/about">
              <About />
            </Route>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route exact path="/reset">
              <PasswordReset />
            </Route>
            <Route exact path="/all">
              <All />
            </Route>
            <Route path="/category/:category">
              <Category />
            </Route>
            <Route path="/tag/:tag">
              <Tag />
            </Route>
            <Route path="/article/:article">
              <Article />
            </Route>
            <Route exact path="/staff">
              <StaffPage />
            </Route>
            <Route path="/staff/:staff">
              <Staff />
            </Route>
            <Route path="/dashboard">
              <DashboardChoice />
            </Route>
            <Route path='/feed' component={() => {
                 window.location.href = '/DyvsZDAh.rss';
                 return null;
            }}/>
          </Switch>
        </div>
      </Router>
    </UserContext.Provider>
  );
}
function Home() {
  var [home, setHome] = useState(null);
  var [original, setOriginal] = useState(null);

  if (original !== true) {
    const ref = db.collection('homepage-grid').doc("grid-info");
    ref.get().then((doc) => {
      if (doc.exists) {
        setHome(doc.data().articles);
        setOriginal(true);
      }
    });
  }
  return (
    <div id="homecontainer">
      <Helmet>
        <title>The Irvington Voice</title>
        <meta name="description" content="The official publication of Irvington High School in Fremont, California" />
      </Helmet>
      <div id="gridwrap">
        <div id="grid-display">
        {home &&
          Object.entries(home).map(([key, value]) => {
            return <FrontPageFeature data={{size: value, id: key}}/>
        })}
        </div>
        
        <div id="footer">
          <div className="footercredit">
            <p>© 2020  • <a target="_blank" href="/">Privacy Policy</a> • <Link to="/login">Log in</Link></p>
          </div>
          <div className="clear"></div>
        </div>
      </div>
    </div>
  );
}
function About() {
  return (
    <div id="container">
      <Helmet>
        <title>{"About | The Irvington Voice"}</title>
      </Helmet>
      <h1>About</h1>
      <p>The Voice is a student-run newspaper with the sole purpose of providing an open forum for student expression. Anything published represents the opinion of the writer, but not necessarily that of the Voicestaff, the administration or faculty of Irvington High School, or any person affiliated with the Fremont Unified School District (FUSD). The Voice does not discriminate against race, political orientation, ethnicity, religion, gender, sexual orientation, or disability. Although the Voice will never refuse to publish student guest submission based on the aforementioned factors, we reserve the right to edit or not publish them.</p>
      <p>We are located at Irvington High School, 41800 Blacow Rd. Fremont, CA 94538</p>
      <p><strong>Contact Information</strong></p>
      <p>Phone: (510)656-5711 ex. 46398</p>
      <p>E-mail: irvingtonvoice@gmail.com</p>
      <p>Facebook:&nbsp;<a href="https://www.facebook.com/theihsvoice" target="_blank" rel="noopener noreferrer">facebook.com/theihsvoice</a></p>
      <p>Instagram: <a href="https://www.instagram.com/ihs.voice" target="_blank" rel="noopener noreferrer">www.instagram.com/ihs.voice</a></p>
      <p>Twitter: <a href="https://twitter.com/ihsvoice" target="_blank" rel="noopener noreferrer">@IHSVoice</a></p>
    </div>
  );
}
function Navbar() {
  return (
    <div>
      <ul id="nav">
        <li><Link to="/category/news">NEWS</Link></li>
        <li><Link to="/category/student-life">STUDENT LIFE</Link></li>
        <li><Link to="/category/opinions">OPINIONS</Link></li>
        <li><Link to="/category/entertainment">ENTERTAINMENT</Link></li>
        <li><Link to="/category/humor">HUMOR</Link></li>
        <li><Link to="/category/sports">SPORTS</Link></li>
        <li><Link to="/category/humans-of-irvington-high">HUMANS OF IHS</Link></li>
      </ul>
    </div>
);
}
//categories
function Category() {
  let {category} = useParams();
  let page = parseInt(useQuery().get("page")) || 1;
  var [articles, setArticles] = useState([]);
  var [original, setOriginal] = useState("");

  if (category + page !== original) {
    var articlesss = [];
    setOriginal(category + page);
    const ref = db.collection('articles').where("categories", "array-contains", category.replace(/-/g, " ")).orderBy("timestamp", "desc").limit(5 * page);
    ref.get().then((querySnapshot) => {
      querySnapshot.forEach(function (doc) {
        articlesss.push(doc.data());
      });
      setArticles(articlesss.slice((page - 1) * 5, page * 5));
    });
  }

  return (
    <div id="container">
      <Helmet>
        <title>{category.replace(/-/g, " ").replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase()) + " | The Irvington Voice"}</title>
      </Helmet>
      <div className="blurbs left">
        <h1>{category.replace(/-/g, " ").replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase())}</h1>
        {
          articles.map((value, index) => {
          return <Blurb key={index} data={value}/>
        })}
        <div className="buttons">
          <Link to={"/category/" + category + "?page=" + (page - 1)}><button id="paginate">previous page</button></Link>
          <Link to={"/category/" + category + "?page=" + (page + 1)}><button id="paginate">next page</button></Link>
        </div>
      </div>
      <Sidebar />
    </div>
  );
}

function Tag() {
  let {tag} = useParams();
  let page = parseInt(useQuery().get("page")) || 1;
  var [articles, setArticles] = useState([]);
  var [original, setOriginal] = useState("");

  if (tag + page !== original) {
    var articlesss = [];
    setOriginal(tag + page);
    const ref = db.collection('articles').where("tags", "array-contains", tag.replace(/-/g, " ")).orderBy("timestamp", "desc").limit(5 * page);
    ref.get().then((querySnapshot) => {
      querySnapshot.forEach(function (doc) {
        articlesss.push(doc.data());
      });
      setArticles(articlesss.slice((page - 1) * 5, page * 5));
    });
  }

  return (
    <div id="container">
      <Helmet>
        <title>{tag.replace(/-/g, " ").replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase()) + " | The Irvington Voice"}</title>
      </Helmet>
      <div className="blurbs left">
        {
          articles.map((value, index) => {
          return <Blurb key={index} data={value}/>
        })}
        <div className="buttons">
          <Link to={"/tag/" + tag + "?page=" + (page - 1)}><button id="paginate">previous page</button></Link>
          <Link to={"/tag/" + tag + "?page=" + (page + 1)}><button id="paginate">next page</button></Link>
        </div>
      </div>
      <Sidebar />
    </div>
  );
}
//tags

//articles
function Article() {
  let {article} = useParams();
  var [original, setOriginal] = useState(null);
  var [data, setData] = useState({headline: "", byline: [""], content: "", categories: [], tags: [], timestamp: new Date()});

  if (article !== original) {
    const ref = db.collection('articles').doc(article);
    ref.get().then((doc) => {
      if (doc.exists) {
        var dataa = doc.data();
        setOriginal(article);
        if (doc.data().permalinkphotobox) {
          storageRef.child('article-photos/' + doc.data().permalinkphotobox.src).getDownloadURL().then((url) => {
            dataa.permalinkphotobox.src = url;
            setData(dataa);
          }).catch(error => {
            setData(dataa);
          });
        }
        else if (doc.data().storyshadow) {
          storageRef.child('article-photos/' + doc.data().storyshadow.src).getDownloadURL().then((url) => {
            dataa.storyshadow.src = url;
            setData(dataa);
          }).catch(error => {
            setData(dataa);
          });
        }
        else {
          setData(dataa);
        }
      }
    });
  }
  return (
    <div id="container">
      <Helmet>
        <title>{data.headline + " | The Irvington Voice"}</title>
        <meta name="description" content={data.content.replace(/<[^>]+>/g, '').substring(0, 290) + "..."} />
      </Helmet>
      <div id="article" className={`${data["full-width"] ? "full-width" : "left classic"}`}>
        <ul className="categories">
          {data.categories.map((value, index) => {
            return <Link key={index} to={`/category/${value.replace(/ /g, "-")}`}><li key={index} className="categories">{value}</li></Link>
          })}
        </ul>
        <h1 className="headline">{data.headline}</h1>
        <div className="clear"></div>
        {data.permalinkphotobox &&
          <div className="permalinkphotobox">
            <div className="photowrap">
              <a className="modal-photo photooverlay" href={data.permalinkphotobox.src}>
                <img src={data.permalinkphotobox.src} alt={data.permalinkphotobox.caption} className="catboxphoto"></img>
              </a>
              <div className="modal-photo photo-enlarge elusive el-icon-zoom-in"></div>
            </div>
            <div className="clear"></div>
            <div className="captionbox">
              <p className="photocredit">{data.permalinkphotobox.credit}</p>
              <p className="photocaption">{data.permalinkphotobox.caption}</p>
            </div>
          </div>
        }
        {data.storyshadow &&
          <div className="storyshadow">
            <div className="photowrap">
              <a className="modal-photo photooverlay" href={data.storyshadow.src}>
                <img src={data.storyshadow.src} alt={data.storyshadow.caption} className="catboxphoto"></img>
              </a>
              <div className="modal-photo photo-enlarge elusive el-icon-zoom-in"></div>
            </div>
            <div className="clear"></div>
            <div className="captionboxtop">
            <p className="photocredit">{data.storyshadow.credit}</p>
            <p className="photocaption">{data.storyshadow.caption}</p>
            </div>
          </div>
        }
        <div className="details">
          <p>
            <span className="byline">{"By " + data.byline.join(", ")}</span>
            <br />
            <span className="pubdate">{new Date(data.timestamp.seconds * 1000 + 18000000).toDateString().substring(4)}</span>
          </p>
        </div>
        {data.content &&
          <span className="content">{ReactHtmlParser(data.content)}</span>
        }
        <div className="clear"></div>
        <ul className="tags">
          {data.tags.map((value, index) => {
            return <li key={index} className="tags"><Link to={`/tag/${value.replace(/ /g, "-")}`}>{value}</Link></li>
          })}
        </ul>
        <div id="aboutwriter">
          {data.byline.length > 1 &&
            <h2>
              About the Writers
            </h2>
          }
          {data.byline.length === 1 &&
            <h2>
              About the Writer
            </h2>
          }
          {data.byline.map((value, index) => {
            return <AboutWriter key={index} staffName={value}/>
          })}
        </div>
      </div>
      {!data["full-width"] &&
        <Sidebar />
      }
    </div>
  );
}
//staff page
function Staff() {
  let {staff} = useParams();
  var [original, setOriginal] = useState(null);
  var [data, setData] = useState({name: "", position: "", bio: "", image: ""});
  var [articles, setArticles] = useState([]);

  if (staff !== original) {
    setOriginal(staff);
    const ref = db.collection('users').where("id", "==", staff);
    var users = [];
    ref.get().then((querySnapshot) => {
      querySnapshot.forEach(function (doc) {
        users.push(doc.data());
      });
      if (users[0]) {
        setData(users[0])
        const ref2 = db.collection('articles').where("byline", "array-contains", users[0].name).orderBy("timestamp", "desc");
        var articless = [];
        ref2.get().then((querySnapshot) => {
          querySnapshot.forEach(function (doc) {
              articless.push(doc.data());
          });
          setArticles(articless)
        });
      }
    });
  }

  return (
    <div id="container">
      <Helmet>
        <title>{data.name + " | The Irvington Voice"}</title>
      </Helmet>
      <div id="staff">
        <div className="staff left">
          <img id="header" src={data.image} alt={data.name}></img>
          <p>
            <span id="bio">{data.bio}</span>
          </p>
        </div>
        <div className="staff right">
          <strong><h1 id="staffname">{data.name + ", " + data.position}</h1></strong>
          <table className="blurbs">
            <tbody>
              {
                articles.map((value, index) => {
                return <StaffPageBlurb key={index} data={value}/>
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
function StaffPage() {
  var [users, setUsers] = useState([]);
  var [original, setOriginal] = useState(null);

  if (original !== true) {
    var userss = [];
    const ref = db.collection('users');
    ref.get().then((querySnapshot) => {
      querySnapshot.forEach(function (doc) {
          userss.push(doc.data());
      });
      setUsers(userss);
      setOriginal(true);
    });
  }

  return (
    <div id="container">
      <Helmet>
        <title>{"Staff | The Irvington Voice"}</title>
      </Helmet>
      <h1>Staff</h1>
      <div className="grid">
        {users.map((value, index) => {
          return(
            <div key={index} className={"staff y" + value.years.join(" y")} style={{backgroundImage: `url(${value.image})`, backgroundSize: "cover", backgroundPosition: "center", }}>
              <div className="staffinfo"><span>{value.bio.substring(0, 290) + "..."}</span></div>
              <div>
                <Link to={`/staff/${value.id}`}>
                  <div className="staffname">{value.name + ", " + value.position}</div>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
//other stuff
function Blurb(props) {
  return (
    <div className="blurb">
      <Link to={`/article/${props.data.id}`}><h1 className="headline">{props.data.headline}</h1></Link>
      <div>
        <p>
          <span className="byline">{"By " + props.data.byline.join(", ")}</span>
          <br />
          <span className="pubdate">{new Date(props.data.timestamp.seconds * 1000 + 18000000).toDateString().substring(4)}</span>
          <br />
          <br />
          {props.data.content &&
            <span className="content">{props.data.content.replace(/<[^>]+>/g, '').substring(0, 290) + "..."}</span>
          }
        </p>
      </div>
    </div>
  );
}
function StaffPageBlurb(props) {
  return (
    <div id="blurb">
      <Link to={`/article/${props.data.id}`}>
        <tr>
          <td className="pubdate">{new Date(props.data.timestamp.seconds * 1000 + 18000000).toDateString().substring(4)}</td>
          <td className="staffheadline">{props.data.headline}</td>
        </tr>
      </Link>
    </div>
  );
}
function AboutWriter(props) {
  var [original, setOriginal] = useState(null);
  var [data, setData] = useState({name: "", position: "", bio: "", image: "", id: ""});

  if (original !== true) {
    if (props.staffName) {
      const ref = db.collection('users').doc(props.staffName);
      ref.get().then((doc) => {
        if (doc.exists) {
          setData(doc.data());
          setOriginal(true);
        }
      });
    }
  }
  return (
    <div className="writer">
      {data && data.name !== "" &&
        <div>
          <img id="profpic" src={data.image} alt={data.name}></img>
          <div>
            <Link to={`/staff/${data.id}`}><p><strong><span className="staffaboutname">{data.name + ", " + data.position}</span></strong></p></Link>
            <p>
              <span id="bio">{data.bio}</span>
            </p>
          </div>
        </div>
      }
    </div>
  );
}
function Sidebar() {
  var [articles, setArticles] = useState([]);
  var [original, setOriginal] = useState(null);

  if (original !== true) {
    var articless = [];
    setOriginal(true);
    const ref = db.collection('articles').orderBy("timestamp", "desc").limit(5);
    ref.get().then((querySnapshot) => {
      querySnapshot.forEach(function (doc) {
          articless.push(doc.data());
      });
      setArticles(articless)
    });
  }

  return (
    <div id="sidebar" className="right">
      <div id="sidebarwrap">
        <div id="sidebarhead">
          Recent Posts
        </div>
        <ul id="sidebarblurbs" className="blurbs">
          {
            articles.map((value, index) => {
              return <li key={index}><SideBlurb data={value}/></li>
          })}
        </ul>
      </div>
    </div>
  );
}
function SideBlurb(props) {
  return (
    <div className="blurb">
      <Link to={`/article/${props.data.id}`}><p className="headline">{props.data.headline}</p></Link>
      <div>
        <p>
          <span className="byline">{"By " + props.data.byline.join(", ")}</span>
          <br />
          <span className="pubdate">{new Date(props.data.timestamp.seconds * 1000 + 18000000).toDateString().substring(4)}</span>
        </p>
      </div>
    </div>
  );
}
function All() {
  var [articles, setArticles] = useState([]);
  var [original, setOriginal] = useState(null);

  if (original !== true) {
    var articless = [];
    const ref = db.collection('articles').orderBy("timestamp", "desc");
    ref.get().then((querySnapshot) => {
      querySnapshot.forEach(function (doc) {
          articless.push(doc.data());
      });
      console.log(querySnapshot.docs.length);
      setArticles(articless);
      setOriginal(true);
    });
  }

  return (
    <div id="container">
      <Helmet>
        <title>{"All Articles | The Irvington Voice"}</title>
      </Helmet>
      <div className="blurbs left">
        {
          articles.map((value, index) => {
          return <Blurb key={index} data={value}/>
        })}
      </div>
      <Sidebar />
    </div>
  );
}
//front page
function FrontPageFeature(props) {
  var [original, setOriginal] = useState(null);
  var [data, setData] = useState({headline: "", byline: [""], content: "", categories: [], tags: [], timestamp: new Date()});

  if (original !== true) {
    const ref = db.collection('articles').doc(props.data.id);
    ref.get().then((doc) => {
      if (doc.exists) {
        setOriginal(true);
        var dataa = doc.data()
        if (doc.data().permalinkphotobox) {
          storageRef.child('article-photos/' + doc.data().permalinkphotobox.src).getDownloadURL().then((url) => {
            dataa.permalinkphotobox.src = url;
            setData(dataa)
          }).catch(error => {
            setData(dataa)
          });
        }
        else if (doc.data().storyshadow) {
          storageRef.child('article-photos/' + doc.data().storyshadow.src).getDownloadURL().then((url) => {
            dataa.storyshadow.src = url;
            setData(dataa)
          }).catch(error => {
            setData(dataa)
          });
        }
        else {
          dataa.permalinkphotobox.src = "https://moundspet.com/wp-content/uploads/2017/03/Placeholder-1.png";
          setData(dataa)
        }
      }
    });
  }
  return (
    <div style={{gridArea: props.data.size}}>
      {data.permalinkphotobox &&
        <div style={{width: "100%", height: "100%", backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${data.permalinkphotobox.src})`, backgroundSize: "cover", backgroundPosition: "center", display: "flex", justifyContent: "center", alignItems: "center"}}>
          <div style={{textAlign: "center"}}>
            <Link to={`/article/${data.id}`} style={{color: "white", textDecorationColor: "white"}}><span className="headline" style={{fontSize: "2vw"}}>{data.headline}</span></Link>
            <br />
            <span className="byline" style={{color: "white",fontSize: "70%"}}>{"By " + data.byline.join(", ")}</span>
          </div>
        </div>
      }
      {data.storyshadow &&
        <div style={{width: "100%", height: "100%", backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${data.storyshadow.src})`, backgroundSize: "cover", backgroundPosition: "center", display: "flex", justifyContent: "center", alignItems: "center"}}>
          <div style={{textAlign: "center"}}>
            <Link to={`/article/${data.id}`} style={{color: "white", textDecorationColor: "white"}}><span className="headline" style={{fontSize: "2vw"}}>{data.headline}</span></Link>
            <br />
            <span className="byline" style={{color: "white",fontSize: "70%"}}>{"By " + data.byline.join(", ")}</span>
          </div>
        </div>
      }
      {!data.storyshadow && !data.permalinkphotobox &&
        <div style={{width: "100%", height: "100%", backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url("https://moundspet.com/wp-content/uploads/2017/03/Placeholder-1.png")`, backgroundSize: "cover", backgroundPosition: "center", display: "flex", justifyContent: "center", alignItems: "center"}}>
          <div style={{textAlign: "center"}}>
            <Link to={`/article/${data.id}`} style={{color: "white", textDecorationColor: "white"}}><span className="headline" style={{fontSize: "2vw"}}>{data.headline}</span></Link>
            <br />
            <span className="byline" style={{color: "white",fontSize: "70%"}}>{"By " + data.byline.join(", ")}</span>
          </div>
        </div>
      }
    </div>
  );
}
//acc stuff
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const history = useHistory();
  const {setAllInfo} = useContext(UserContext);

  const signInWithEmailAndPasswordHandler = async(event, email, password) => {
    event.preventDefault();
    await auth.signInWithEmailAndPassword(email, password).catch(error => {
      setError("Error signing in with password and email!");
      console.error("Error signing in with password and email", error);
    });
    history.push("/dashboard");
  };

  const onChangeHandler = (event) => {
      const {name, value} = event.currentTarget;

      if(name === 'userEmail') {
          setEmail(value);
      }
      else if(name === 'userPassword'){
        setPassword(value);
      }
  };

  return (
    <div id="container">
      <Helmet>
        <title>{"Login | The Irvington Voice"}</title>
      </Helmet>
      <h1>Sign In</h1>
      <p>This page is for Voice members only. If this does not apply to you, please navigate back to the main page.</p>
      <div>
        {error !== null && <div>{error}</div>}
        <form>
          <label htmlFor="userEmail">
            Email:
          </label>
          <input
            type="email"
            name="userEmail"
            value = {email}
            placeholder="E.g: irvingtonvoice@gmail.com"
            id="userEmail"
            onChange = {(event) => onChangeHandler(event)}
          />
          <label htmlFor="userPassword">
            Password:
          </label>
          <input
            type="password"
            name="userPassword"
            value = {password}
            placeholder="Your Password"
            id="userPassword"
            onChange = {(event) => onChangeHandler(event)}
          />
          <button onClick = {(event) => {
            signInWithEmailAndPasswordHandler(event, email, password);
            setAllInfo(email);
          }}>
            Sign in
          </button>
        </form>
        <p>
          <Link to = "reset">
            Forgot Password?
          </Link>
        </p>
      </div>
    </div>
  );
};
function PasswordReset() {
  const [email, setEmail] = useState("");
  const [emailHasBeenSent, setEmailHasBeenSent] = useState(false);
  const [error, setError] = useState(null);
  const onChangeHandler = event => {
    const { name, value } = event.currentTarget;
    if (name === "userEmail") {
      setEmail(value);
    }
  };
  const sendResetEmail = event => {
    event.preventDefault();
    auth
      .sendPasswordResetEmail(email)
      .then(() => {
        setEmailHasBeenSent(true);
        setTimeout(() => {setEmailHasBeenSent(false)}, 3000);
      })
      .catch(() => {
        setError("Error resetting password");
      });
  };
  return (
    <div id="container">
      <Helmet>
        <title>{"Reset Password | The Irvington Voice"}</title>
      </Helmet>
      <h1>
        Reset your Password
      </h1>
      <div>
        <form action="">
          {emailHasBeenSent && (
            <div>
              An email has been sent to you!
            </div>
          )}
          {error !== null && (
            <div>
              {error}
            </div>
          )}
          <label htmlFor="userEmail">
            Email:
          </label>
          <input
            type="email"
            name="userEmail"
            id="userEmail"
            value={email}
            placeholder="Input your email"
            onChange={onChangeHandler}
            className="mb-3 w-full px-1 py-2"
          />
          <button onClick = {(event) => {sendResetEmail(event)}} >
            Send me a reset link
          </button>
        </form>
        <Link to ="login" >
          &larr; back to sign in page
        </Link>
      </div>
    </div>
  );
};
function DashboardChoice() {
  const history = useHistory();
  var user = firebase.auth().currentUser;

  if (!user) {
    history.push("/login");
  }

  return (
    <Switch>
      <Route exact path={`/dashboard`}>
        <Dashboard/>
      </Route>
      <Route exact path={`/dashboard/editor`}>
        <Uploader type={"new"}/>
      </Route>
      <Route path={`/dashboard/editor/draft/:draft`}>
        <Uploader type={"draft"}/>
      </Route>
      <Route path={`/dashboard/editor/article/:article`}>
        <Uploader type={"article"}/>
      </Route>
      <Route exact path={`/dashboard/customize`}>
        <Customize/>
      </Route>
    </Switch>
  )
};
function Dashboard() {
  const history = useHistory();
  var [drafts, setDrafts] = useState([]);
  var [submitted, setSubmitted] = useState([]);
  var [approved, setApproved] = useState([]);
  var [review, setReview] = useState([]);
  var [status, setStatus] = useState(null);
  const {userInfo} = useContext(UserContext);

  var articles = [];
  var articles2 = [];
  var articles3 = [];
  var articles4 = [];

  const ref4 = db.collection('articles').where("byline", "array-contains", userInfo.name);
  ref4.get().then((querySnapshot) => {
    querySnapshot.forEach(function (doc) {
        articles4.push(doc.data());
    });
    setApproved(articles4);
  });
  const ref2 = db.collection('drafts').where("byline", "array-contains", userInfo.name);
  ref2.get().then((querySnapshot) => {
    querySnapshot.forEach(function (doc) {
        if (doc.data().submitted) {
          articles2.push(doc.data());
        }
        else {
          articles.push(doc.data());
        }
    });
    setDrafts(articles);
    setSubmitted(articles2);
  });
  if (userInfo.position.includes("Editor")) {
    const ref3 = db.collection('drafts').where("submitted", "==", true);
    ref3.get().then((querySnapshot) => {
      querySnapshot.forEach(function (doc) {
          articles3.push(doc.data());
      });
      setReview(articles3);
    });
  }

  const signOut = (event) => {
    event.preventDefault();
    auth.signOut();
    history.push("/login");
  };

  const approveAll = (event) => {
    event.preventDefault();
    alert("Articles approved!");
    setStatus("Articles approved!");
    for (var i = 0; i < review.length; i++) {
      var x = review[i]
      x.timestamp = new Date()
      db.collection("articles").doc(x.id).set(x).then(() => {
      });
      db.collection("drafts").doc(x.id).delete()
      .catch(error => {
          console.log(error)
      })
    }
  };

  return (
    <div id="container">
      <Helmet>
        <title>{"Dashboard | The Irvington Voice"}</title>
      </Helmet>
      {userInfo &&
        <h1>{"Welcome, " + userInfo.name.split(" ")[0] + "."}</h1>
      }
      <Link to="dashboard/editor"><p>New Article</p></Link>
      {userInfo.position.includes("Editor") &&
        <Link to="dashboard/customize"><p>Customize Site</p></Link>
      }
      {review.length > 0 &&
        <div>
          <h3>To Review</h3>
          <button onClick = {(event) => {approveAll(event)}}>Approve All</button>
          <table id="draft">
            <tbody id="draft" style={{display: "inline-block"}}>
              {review &&
                review.map((value, index) => {
                return <Draft key={index} data={value}/>
              })}
            </tbody>
          </table>
        </div>
      }
      {drafts.length > 0 &&
        <div>
          <h3>Saved Drafts</h3>
          <table id="draft">
            <tbody id="draft" style={{display: "inline-block"}}>
              {drafts &&
                drafts.map((value, index) => {
                return <Draft key={index} data={value}/>
              })}
            </tbody>
          </table>
        </div>
      }
      {submitted.length > 0 &&
        <div>
          <h3>Submitted Drafts</h3>
          <table id="draft">
            <tbody id="draft" style={{display: "inline-block"}}>
              {submitted &&
                submitted.map((value, index) => {
                return <Submitted key={index} data={value}/>
              })}
            </tbody>
          </table>
        </div>
      }
      {approved.length > 0 &&
        <div>
          <h3>Approved Articles</h3>
          <table id="draft">
            <tbody id="draft" style={{display: "inline-block"}}>
              {approved &&
                approved.map((value, index) => {
                return <Approved key={index} data={value}/>
              })}
            </tbody>
          </table>
        </div>
      }
      {status !== null && status === "Articles approved!" && (
        <div style={{color: "green"}}>
          {status}
        </div>
      )}
      <button id="signout" onClick = {(event) => {signOut(event)}}>Sign out</button>
    </div>
  )
};
function Uploader(props) {
  var [headline, setHeadline] = useState('');
  var [byline, setByline] = useState('');
  var [cats, setCats] = useState('');
  var [tags, setTags] = useState('');
  var [articleText, setArticleText] = useState('');
  var [articleId, setArticleId] = useState('');
  var [photoType, setPhotoType] = useState('');
  var [photoFile, setPhotoFile] = useState('');
  var [photoFileName, setPhotoFileName] = useState('');
  var [photoCaption, setPhotoCaption] = useState('');
  var [photoCredit, setPhotoCredit] = useState('');
  var [fullWidth, setFullWidth] = useState(false);
  var [original, setOriginal] = useState({headline: "", byline: "", content: "", categories: "", tags: "", id: "", ptype: "", caption: "", credit: "", src: ""})

  var [status, setStatus] = useState(null);
  const {userInfo} = useContext(UserContext);
  let {url} = useRouteMatch();

  if (props.type === "draft" && original.headline === "") {
    var draftname = url.split("/")[url.split("/").length - 1];
    const ref = db.collection('drafts').doc(draftname);
    ref.get().then((doc) => {
      if (doc.exists) {
        var data = doc.data()
        setHeadline(data.headline)
        setByline(data.byline.join(", "))
        setArticleText(data.content)
        setArticleId(data.id)
        setCats(data.categories.join(", "))
        setTags(data.tags.join(", "))
        if (data.permalinkphotobox) {
          setPhotoType("permalinkphotobox");
          setPhotoCaption(data.permalinkphotobox.caption)
          setPhotoCredit(data.permalinkphotobox.credit)
          setPhotoFileName(data.permalinkphotobox.src)
          setOriginal({headline: data.headline, byline: data.byline.join(", "), content: data.content, categories: data.categories.join(", "), tags: data.tags.join(", "), id: data.id, ptype: "permalinkphotobox", caption: data.permalinkphotobox.caption, credit: data.permalinkphotobox.credit, src: data.permalinkphotobox.src})
        }
        else if (data.storyshadow) {
          setPhotoType("storyshadow");
          setPhotoCaption(data.storyshadow.caption)
          setPhotoCredit(data.storyshadow.credit)
          setPhotoFileName(data.storyshadow.src)
          setOriginal({headline: data.headline, byline: data.byline.join(", "), content: data.content, categories: data.categories.join(", "), tags: data.tags.join(", "), id: data.id, ptype: "storyshadow", caption: data.storyshadow.caption, credit: data.storyshadow.credit, src: data.storyshadow.src})
        }
        else {
          setOriginal({headline: data.headline, byline: data.byline.join(", "), content: data.content, categories: data.categories.join(", "), tags: data.tags.join(", "), id: data.id, ptype: "", caption: "", credit: "", src: ""})
        }
        if (data["full-width"]) {
          setFullWidth(data["full-width"]);
        }
      }
      else {
      }
    });
  }
  else if (props.type === "article" && original.headline === "") {
    draftname = url.split("/")[url.split("/").length - 1];
    const ref = db.collection('articles').doc(draftname);
    ref.get().then((doc) => {
      if (doc.exists) {
        var data = doc.data()
        setHeadline(data.headline)
        setByline(data.byline.join(", "))
        setArticleText(data.content)
        setCats(data.categories.join(", "))
        setTags(data.tags.join(", "))
        if (data.permalinkphotobox) {
          setPhotoType("permalinkphotobox");
          setPhotoCaption(data.permalinkphotobox.caption)
          setPhotoCredit(data.permalinkphotobox.credit)
          setPhotoFileName(data.permalinkphotobox.src)
          setOriginal({headline: data.headline, byline: data.byline.join(", "), content: data.content, categories: data.categories.join(", "), tags: data.tags.join(", "), id: data.id, ptype: "permalinkphotobox", caption: data.permalinkphotobox.caption, credit: data.permalinkphotobox.credit, src: data.permalinkphotobox.src})
        }
        else if (data.storyshadow) {
          setPhotoType("storyshadow");
          setPhotoCaption(data.storyshadow.caption)
          setPhotoCredit(data.storyshadow.credit)
          setPhotoFileName(data.storyshadow.src)
          setOriginal({headline: data.headline, byline: data.byline.join(", "), content: data.content, categories: data.categories.join(", "), tags: data.tags.join(", "), id: data.id, ptype: "storyshadow", caption: data.storyshadow.caption, credit: data.storyshadow.credit, src: data.storyshadow.src})
        }
        else {
          setOriginal({headline: data.headline, byline: data.byline.join(", "), content: data.content, categories: data.categories.join(", "), tags: data.tags.join(", "), id: data.id, ptype: "", caption: "", credit: "", src: ""})
        }
        if (data["full-width"]) {
          setFullWidth(data["full-width"]);
        }
      }
    });
  }

  const upload = async(event, headline, byline, articleText, submitted) => {
    event.preventDefault();
    byline = byline.toString().split(', ').join(',');
    if (cats !== "" && cats !== []) {
      cats = cats.toString().toLowerCase().split(', ').join(',').split(',');
    }
    else {
      cats = []
    }
    if (tags !== "" && tags !== []) {
      tags = tags.toString().toLowerCase().split(', ').join(',').split(',');
    }
    else {
      tags = []
    }
    if (articleId.length === 0) {
      var id = headline.toLowerCase().replace(/ /g, "-").replace(/[^a-zA-Z0-9-_]/g, '');
    }
    else {
      id = articleId;
    }
    if (headline !== "") {
      if (!byline.includes(userInfo.name) && byline !== "") {
        setByline(byline += ("," + userInfo.name));
      }
      if (byline === "") {
        byline = userInfo.name;
        setByline((userInfo.name));
      }
      if (submitted) {
        setStatus("Draft submitted!");
      }
      else {
        setStatus("Draft saved!");
      }
      if (photoType === "permalinkphotobox" && photoFile !== "") {
        db.collection("drafts").doc(id).set({
            id: id,
            headline: headline,
            byline: byline.split(', ').join(',').split(','),
            content: articleText,
            categories: cats,
            tags: tags,
            submitted: submitted,
            "full-width": fullWidth,
            permalinkphotobox: {
              src: photoFileName,
              caption: photoCaption,
              credit: photoCredit
            }
        }, { merge: true })
        .then(function() {

        })
        .catch(function(error) {
            setStatus("Error saving article. Please retry.");
        });
        var ref = firebase.storage().ref().child('article-photos/' + photoFileName.name);
        ref.put(photoFile).then(function(snapshot) {
        });
      }
      else if (photoType === "storyshadow" && photoFile !== "") {
        db.collection("drafts").doc(id).set({
            id: id,
            headline: headline,
            byline: byline.split(','),
            content: articleText,
            categories: cats,
            tags: tags,
            submitted: submitted,
            "full-width": fullWidth,
            storyshadow: {
              src: photoFileName,
              caption: photoCaption,
              credit: photoCredit
            }
        }, { merge: true })
        .catch(function(error) {
            setStatus("Error saving article. Please retry.");
        });
        ref = firebase.storage().ref().child('article-photos/' + photoFile.name);
        ref.put(photoFile).then(function(snapshot) {
        });
      }
      else {
        db.collection("drafts").doc(id).set({
            id: id,
            headline: headline,
            byline: byline.split(','),
            content: articleText,
            categories: cats,
            tags: tags,
            submitted: submitted,
            "full-width": fullWidth,
        }, { merge: true })
        .catch(function(error) {
            setStatus("Error saving article. Please retry.");
        });
      }
    }
    else {
      setStatus("Please enter a value for the headline.");
    }
  };

  const approve = async(event, headline, byline, articleText) => {
    event.preventDefault();
    byline = byline.toString().split(', ').join(',');
    if (cats !== "" && cats !== []) {
      cats = cats.toString().toLowerCase().split(', ').join(',').split(',');
    }
    else {
      cats = []
    }
    if (tags !== "" && tags !== []) {
      tags = tags.toString().toLowerCase().split(', ').join(',').split(',');
    }
    else {
      tags = []
    }
    if (articleId.length === 0) {
      var id = headline.toLowerCase().replace(/ /g, "-").replace(/[^a-zA-Z0-9-_]/g, '');
    }
    else {
      id = articleId;
    }
    if (headline !== "") {
      if (!byline.includes(userInfo.name) && byline !== "") {
        setByline(byline += ("," + userInfo.name));
      }
      if (byline === "") {
        byline = userInfo.name;
        setByline((userInfo.name));
      }
      setStatus("Article uploaded!");
      if (photoType === "permalinkphotobox" && photoFile !== "") {
        db.collection("articles").doc(id).set({
            id: id,
            headline: headline,
            byline: byline.split(', ').join(',').split(','),
            content: articleText,
            categories: cats,
            tags: tags,
            "full-width": fullWidth,
            permalinkphotobox: {
              src: photoFileName,
              caption: photoCaption,
              credit: photoCredit
            },
            timestamp: new Date()
        }, { merge: true })
        .then(function() {

        })
        .catch(function(error) {
            setStatus("Error saving article. Please retry.");
        });
        var ref = firebase.storage().ref().child('article-photos/' + photoFileName.name);
        ref.put(photoFile).then(function(snapshot) {
        });
      }
      else if (photoType === "storyshadow" && photoFile !== "") {
        db.collection("articles").doc(id).set({
            id: id,
            headline: headline,
            byline: byline.split(','),
            content: articleText,
            categories: cats,
            tags: tags,
            "full-width": fullWidth,
            storyshadow: {
              src: photoFileName,
              caption: photoCaption,
              credit: photoCredit
            },
            timestamp: new Date()
        }, { merge: true })
        .then(function() {

        })
        .catch(function(error) {
            setStatus("Error saving article. Please retry.");
        });
        ref = firebase.storage().ref().child('article-photos/' + photoFile.name);
        ref.put(photoFile).then(function(snapshot) {
        });
      }
      else {
        db.collection("articles").doc(id).set({
            id: id,
            headline: headline,
            byline: byline.split(','),
            content: articleText,
            categories: cats,
            tags: tags,
            "full-width": fullWidth,
            timestamp: new Date()
        }, { merge: true })
        .then(function() {
            
        })
        .catch(function(error) {
            setStatus("Error saving article. Please retry.");
        });
      }
      db.collection("drafts").doc(id).delete()
      .catch(error => {
          console.log(error)
      })
    }
    else {
      setStatus("Please enter a value for the headline.");
    }
  };

  const onChangeHandler = (event) => {
      const {name, value} = event.currentTarget;

      if(name === 'headline') {
        setHeadline(value);
      }
      else if(name === 'addByline'){
        setByline(value);
      }
      else if(name === 'addCats'){
        setCats(value);
      }
      else if(name === 'addTags'){
        setTags(value);
      }
      else if(name === 'idname') {
        setArticleId(value);
      }
      else if(name === 'photoFile'){
        setPhotoFile(event.target.files[0]);
        setPhotoFileName(event.target.files[0].name);
      }
      else if(name === 'photoCaption'){
        setPhotoCaption(value);
      }
      else if(name === 'photoCredit'){
        setPhotoCredit(value);
      }
      else if(name === 'ptype'){
        setPhotoType(value);
      }
      else if(name === 'fullwidth'){
        setFullWidth(!fullWidth);
      }
  };

  const handleChange = (content) => {
    setArticleText(content); //Get Content Inside Editor
  }

  return (
    <div id="container">
      <Helmet>
        <title>{"Article Uploader | The Irvington Voice"}</title>
      </Helmet>
      <Link to ="/dashboard" >
        &larr; back to dashboard
      </Link>
      <h1>Article Uploader</h1>
      <div>
        <form>
          <h2>Article Information</h2>
          <label htmlFor="headline">
            Headline:
          </label>
          <input
            type="text"
            name="headline"
            defaultValue = {original.headline}
            placeholder="Headline"
            onChange = {(event) => onChangeHandler(event)}
          />
          <label htmlFor="addByline">
            Contributors:
          </label>
          <input
            type="text"
            name="addByline"
            defaultValue = {original.byline}
            placeholder="separate names with commas, like this: Geoffrey Zhang, Kelly Feng"
            onChange = {(event) => onChangeHandler(event)}
          />
          <label htmlFor="addCats">
            Categories:
          </label>
          <input
            type="text"
            name="addCats"
            defaultValue = {original.categories}
            placeholder="separate categories with commas, like this: News, Local News"
            onChange = {(event) => onChangeHandler(event)}
          />
          <label htmlFor="addTags">
            Tags:
          </label>
          <input
            type="text"
            name="addTags"
            defaultValue = {original.tags}
            placeholder="separate tags with commas, like this: FUSD, Math"
            onChange = {(event) => onChangeHandler(event)}
          />
          <SunEditor setContents={original.content} onChange={(content) => handleChange(content)}/>
          <hr></hr>
          <h2>Photos</h2>
          <input type="radio" name="ptype" defaultValue="permalinkphotobox" defaultChecked={original.ptype === "permalinkphotobox"} onChange={(event) => onChangeHandler(event)}></input>
          <label htmlFor="permalinkphotobox">Permalinkphotobox</label>
          <input type="radio" name="ptype" defaultValue="storyshadow" defaultChecked={original.ptype === "storyshadow"} onChange={(event) => onChangeHandler(event)}></input>
          <label htmlFor="storyshadow">Storyshadow</label>
          <br></br>
          <br></br>
          <label htmlFor="photoFile">Upload File: </label>
          <input type="file" name="photoFile" onChange={(event) => onChangeHandler(event)}/>
          {original.src &&
            <p>{"Original Setting: " + original.src + ", " + original.ptype}</p>
          }
          <br></br>
          <label htmlFor="addByline">
            Caption:
          </label>
          <input
            type="text"
            name="photoCaption"
            defaultValue = {original.caption}
            placeholder="Caption"
            onChange = {(event) => onChangeHandler(event)}
          />
          <label htmlFor="addByline">
            Credit:
          </label>
          <input
            type="text"
            name="photoCredit"
            defaultValue = {original.credit}
            placeholder="Credit"
            onChange = {(event) => onChangeHandler(event)}
          />
          <hr></hr>
          <h2>Formatting</h2>
          <input type="checkbox" id="fullwidth" name="fullwidth" defaultValue={fullWidth} defaultChecked={fullWidth} onChange={(event) => onChangeHandler(event)}></input>
          <label htmlFor="fullwidth">Full-width article?</label>
          {fullWidth !== null &&
            <p>{"Original Setting: " + fullWidth}</p>
          }
          <hr></hr>
          <h2>Submit</h2>
          <label htmlFor="idname">
            Article Url (will be automatically generated if left empty):
          </label>
          <input
            type="text"
            name="idname"
            defaultValue = {original.id}
            placeholder="ihs-voice-coronavirus-updates"
            onChange = {(event) => onChangeHandler(event)}
          />
          <p>{"The article will be found at https://ihsvoice-f70bd.firebaseapp.com/article/" + articleId}</p>
          <button onClick = {(event) => {upload(event, headline, byline, articleText, false)}}>
            Save
          </button>
          <button onClick = {(event) => {upload(event, headline, byline, articleText, true)}}>
            Submit
          </button>
          {userInfo && userInfo.position.includes("Editor") &&
          <button onClick = {(event) => {approve(event, headline, byline, articleText)}}>
            Upload
          </button>
          }
          {status !== null && (status === "Draft submitted!" || status === "Draft saved!" || status === "Article uploaded!") && (
            <div style={{color: "green"}}>
              {status}
            </div>
          )}
          {status !== null && status !== "Draft submitted!" && status !== "Draft saved!" && status !== "Article uploaded!" && (
            <div style={{color: "red"}}>
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
function Draft(props) {
  return (
    <tr id="draft">
        <td className="staffheadline">
          <Link to={`/dashboard/editor/draft/${props.data.id}`}>{props.data.headline}</Link>
        </td>
    </tr>
  );
}
function Submitted(props) {
  return (
    <tr id="draft">
      <td className="staffheadline">{props.data.headline}</td>
    </tr>
  );
}
function Approved(props) {
  return (
    <tr id="draft">
      <td className="staffheadline">
        <Link to={`/dashboard/editor/article/${props.data.id}`}>{props.data.headline}</Link>
      </td>
    </tr>
  );
}
function Customize() {
  const history = useHistory();
  const {userInfo} = useContext(UserContext);
  if (!userInfo.position.includes("Editor")) {
    history.push("/dashboard");
  }
  return (
    <div id="container">
      <Helmet>
        <title>{"Customize Site | The Irvington Voice"}</title>
      </Helmet>
      <Link to ="/dashboard" >
        &larr; back to dashboard
      </Link>
      <h1>Site Customization</h1>
      <div>
        <p>work in progress. i'll finish this after ap exams prob</p>
      </div>
    </div>
  );
}