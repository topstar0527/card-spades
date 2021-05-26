import React from 'react';
import ReactDom from 'react-dom';

import {
  cx,
  getDisplayName,
} from './lib.js';
import packageJson from '../package.json';

// STATIC DATA

export const SUITS = {
  SPADES:   's',
  CLUBS:    'c',
  HEARTS:   'h',
  DIAMONDS: 'd'
};

export const VALUES = {
  ACE:   'a',
  KING:  'k',
  QUEEN: 'q',
  JACK:  'j',
  TEN:   '0',
  NINE:  '9',
  EIGHT: '8',
  SEVEN: '7',
  SIX:   '6',
  FIVE:  '5',
  FOUR:  '4',
  THREE: '3',
  TWO:   '2'
};

// HIGHER ORDER COMPONENTS

export const withHotKeys = mapPropsToKeys => WrappedComponent => {
  class WithHotKeys extends React.Component {
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  WithHotKeys.displayName = `WithHotKeys(${getDisplayName(WrappedComponent)})`;
  return WithHotKeys;
}

export const withActions = (actions, initState) => WrappedComponent => {
  class WithReducer extends React.Component {
    state = initState

    handleAction = action => data => {
      this.setState(action(this.state, data))
    }

    actions = Object.keys(actions).reduce((acc, action) => ({
      ...acc,
      [action]: this.handleAction(actions[action])
    }), {})

    render() {
      return <WrappedComponent {...this.state} {...this.actions} />;
    }
  }

  WithReducer.displayName = `WithReducer(${getDisplayName(WrappedComponent)})`;
  return WithReducer;
}

export const withStateMachine = ({
  initialMode,
  modes
}) => WrappedComponent => {
  class WithStateMachine extends React.Component {
    state = {
      mode: initialMode,
      data: modes[initialMode]
    }

    handleAction = action => data => {
      this.setState({ data: action(this.state.data, data) });
    }

    handleTransition = transition => data => {
      this.setState(transition(this.state, data));
    }

    // TODO: MEMOIZE
    getMappedActions = actions => Object.keys(actions).reduce((acc, a) => ({
      ...acc,
      [a]: this.handleAction(actions[a])
    }), {})

    // TODO: MEMOIZE
    getMappedTransitions = transitions => (
      Object.keys(transitions).reduce((acc, t) => ({
        ...acc,
        [t]: this.handleTransition(transitions[t])
      }), {})
    )

    render() {
      const { transitions, actions } = modes[this.state.mode];

      return (
        <WrappedComponent
          mode={this.state.mode}
          data={this.state.data}
          actions={this.getMappedActions(actions)}
          transitions={this.getMappedTransitions(transitions)}
        />
      );
    }
  }

  WithStateMachine.displayName = (
    `WithStateMachine(${getDisplayName(WrappedComponent)})`
  );
  return WithStateMachine;
}

// COMPONENTS

export const Card = ({
  width = 80,
  suit,
  value
}) => (
  <img
    width={width}
    alt={`The ${value.toLowerCase()} of ${suit.toLowerCase()}`}
    src={`/imgs/cards/${SUITS[suit]}${VALUES[value]}.svg`}
  />
);

export const Footer = ({ className }) => (
  <footer className={cx([
    "Footer",
    className
  ])}>
    V { packageJson.version }
  </footer>
);

export const Menu = ({ children }) => (
  <ul className="Menu">
    { children }
  </ul>
);

export const MenuItem = ({ to, children }) => (
  <a href={`#${to}`}>
    <li className="Menu-item">
      { children }
    </li>
  </a>
);

export const Title = ({ className }) => (
  <h1 className={cx([
    'Title',
    className
  ])}>Spades</h1>
);

export const WelcomeScreen = ({ children }) => (
  <main className="WelcomeScreen">
    <section className="WelcomeScreen-content">
      <Title className="WelcomeScreen-title" />
      {children}
    </section>
    <Footer className="WelcomeScreen-footer" />
  </main>
);

// APP STATE LOGIC

export const Play = () => <div>Play Stub</div>;

export const Records = () => <div>Records Stub</div>;

export const Root = () => (
  <WelcomeScreen>
    <Menu>
      <MenuItem to='/select-variant'>New Game</MenuItem>
      <MenuItem to='/play'>Continue</MenuItem>
      <MenuItem to='/records'>Records</MenuItem>
      <MenuItem to='/settings'>Settings</MenuItem>
    </Menu>
  </WelcomeScreen>
);

export const SelectLevel = () => (
  <WelcomeScreen>
    <Menu>
      <MenuItem to='/play'>1</MenuItem>
      <MenuItem to='/play'>2</MenuItem>
      <MenuItem to='/play'>3</MenuItem>
      <MenuItem to='/play'>4</MenuItem>
      <MenuItem to='/play'>5</MenuItem>
    </Menu>
  </WelcomeScreen>
);

export const Settings = () => <div>Settings Stub</div>;

export const Variants = () => (
  <WelcomeScreen>
    <Menu>
      <MenuItem to='/select-level'>Standard</MenuItem>
      <MenuItem to='/select-level'>Whiz</MenuItem>
      <MenuItem to='/select-level'>Suicide</MenuItem>
      <MenuItem to='/select-level'>Free for All</MenuItem>
    </Menu>
  </WelcomeScreen>
);

export const ROUTES = [
  {
    path: "/",
    component: Root,
  },
  {
    path: '/select-variant',
    component: Variants,
  },
  {
    path: `/select-level`,
    component: SelectLevel,
  },
  {
    path: '/play',
    component: Play,
  }
];

export class Spades extends React.Component {
  state = {
    hash: window.location.hash
  }

  componentDidMount() {
    window.addEventListener('hashchange', this.setHash);
  }

  componentWillDismount() {
    window.removeEventListener('hashchange', this.setHash);
  }

  setHash = () => {
    this.setState({ hash: window.location.hash });
  }

  getCurrentComponent = () => {
    const { hash } = this.state;
    const path = (hash === '' || hash === '#')
      ? '/'
      : hash.slice(1);

    const route = ROUTES.find(r => r.path === path);
    return !!route
      ? React.createElement(route.component)
      : null; // TODO: Add some sort of 404 here.
  }

  render() {
    return this.getCurrentComponent();
  }
}

export const main = ({ nodeId }) => {
  ReactDom.render(<Spades />, document.getElementById(nodeId));
};


