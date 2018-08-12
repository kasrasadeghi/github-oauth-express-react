import React, { Fragment, Component } from 'react';

const paramsify = (params) => Object.keys(params).map(k => [k, params[k]].map(encodeURIComponent).join('=')).join('&');

const CLIENT_ID = "26da4942f252fe0bc46c";
const SESSION_KEYS = ['access_token', 'scope', 'token_type'];

const api = new (class {
  request = (method, url, {headers = {}, params = {}} = {}) => 
    fetch(url + (url.includes('?') ? '&' : '?') + paramsify(params), {method, headers})
      .then(res => res.json().catch(err => console.log(err)))
      .catch(console.log);

  get  = this.request.bind(this, 'GET');
  post = this.request.bind(this, 'POST');
})();


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      response: "nothing yet",
      unguessable: Math.random().toString(36).substring(7),
      notes_repo: "none"
    };
  }

  async componentDidMount() {
    api.post("/api/hello").then(res => this.setState({response: res.message}));

    if (window.location.pathname === '/authed') {
      if (window.sessionStorage.getItem('access_token')) {
        this.loadSession();
      } else {
      api.post("/api/postauth" + window.location.search, {
        params: {client_id: CLIENT_ID, redirect_uri: 'http://localhost:3000/authed'},
        headers: {Accept: "application/json"}
      })
      .then(response => {
        if (response) {
          const {access_token, scope, token_type} = response;
          this.setState({access_token, scope, token_type});
          this.saveSession();
        }
      });
    } 
    } else if (window.sessionStorage.getItem('access_token')) {
      window.location.replace("/authed");
    }
  }

  saveSession() {
    for (let key of SESSION_KEYS) {
      window.sessionStorage.setItem(key, this.state[key]);
    }
    this.setState({});
  }

  loadSession() {
    let obj = {};
    for (let key of SESSION_KEYS) {
      obj[key] = window.sessionStorage.getItem(key);
    }
    this.setState(obj);
  }

  getUrl() {
    const params = {
      client_id: CLIENT_ID,
      redirect_uri: "http://" + window.location.host + "/authed",
      scope: "repo",
      state: this.state.unguessable,
      allow_signup: false
    }

    return "https://github.com/login/oauth/authorize?" + paramsify(params);
  }

  refresh() {
    for (let key of SESSION_KEYS) {
      window.sessionStorage.removeItem(key);
    }
    window.location.replace(this.getUrl());
  }

  fetchGithub(path, name, params = {}) {
    const url = "/github" + path + "?" + paramsify({access_token: this.state.access_token, ...params});
    console.log(url);
    api.get(url).then(j => this.setState({[name]: j}));
  }

  renderContent() {
    if (this.state.access_token) {
      return (
      <Fragment>  
        <button onClick={() => this.fetchGithub('/user/repos', 'repos', {sort: 'updated'})}>get repos</button>
        <button onClick={() => this.saveSession()}>save</button>
        <br/>
        <button onClick={() => this.refresh()}>refresh</button>
        <br/>
        <a href="/">home</a>
        {this.state.repos && <Dropdown choices={this.state.repos} getValue={() => this.state.notes_repo} updateValue={notes_repo => this.setState({notes_repo})}/>}
        <pre>{this.state.notes_repo}</pre>
      </Fragment>);
    }
    return (
    <Fragment>
      <a href={this.getUrl()}><button>auth</button></a>
      <button onClick={() => this.loadSession()}>load</button>
      <pre>{JSON.stringify(this.state, null, 2)}</pre>
    </Fragment>);
  }

  render() {
    return (
      <div className="App">
        <pre>access_token: {this.state.access_token} </pre>
        <pre>session: {window.sessionStorage.getItem('access_token')}</pre>
        {this.renderContent()}
      </div>
    );
  }
}

class Dropdown extends Component { 
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     value: "default"
  //   }
  // }
  render() {
    return (
      <select value={this.props.getValue()} onChange={e => this.props.updateValue(e.target.value)}>
        <option value="none">none</option>
        {this.props.choices.map(n => (<option value={n.name}>{n.name}</option>))}
      </select>
    );
  }
}

export default App;
