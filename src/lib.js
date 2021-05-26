// FUNCTIONS

// HIGHER ORDER
// Importantly at the top of the file since
// these may get called at require time.


export const makeSuite = tests => () => (
  tests.reduce((acc, test) => (
    // NOTE: this short-circuits later tests, maybe good?
    acc && test()
  ), true)
);

// LOWLY (SALT_OF_THE_EARTH) FUNCTIONS

export const assertEquals = (
  testDesc,
  leftFn,
  right
) => () => {
  const left = leftFn();
  if (deepEquals(left, right)) {
    console.log(`PASSED: ${testDesc}`);
    return true;
  } else {
    console.error(`FAILED: ${testDesc}`);
    console.log({
      left,
      right
    });
    return false;
  }
};

export const assertIs = (
  testDesc,
  leftFn,
  right
) => () => {
  const left = leftFn();
  if (left === right) {
    console.log(`PASSED: ${testDesc}`);
    return true;
  } else {
    console.error(`FAILED: ${testDesc}`);
    console.log({
      left,
      right
    });
    return false;
  }
};

/**
 * Func: cx (classNames) a utility for inlining classname logic
 *
 * @param: classChunks 
 *   @type: Array<?(String | { [className: String]: Boolean }>
 *   @desc: Chunks of objects to resolve to a single string of classes
 * @return String
 */

export const createAction = type => data => ({ type, data });

export const createStateMachine = ({ initialMode, modes }) => (
  state = {
    mode: initialMode,
    data: modes[initialMode].initialData
  },
  action
) => {
  const { actions, transitions } = modes[state.mode];

  if (transitions[action.type]) {
    // TODO
    return {};
  } else if (actions[action.type]) {
    const newData = actions[action.type](state.data, action.data);

    if (newData !== state.data) {
      return {
        mode: state.mode,
        data: newData
      };
    } else {
      return state;
    }
  } else {
    return state;
  }
};

export const cx = (
  classChunks
) => classChunks.reduce((acc, chunk) => {
  const chunkType = typeOf(chunk).type;
  if (chunkType === 'undefined' || chunkType === 'null') {
    return acc;
  } else if (chunkType === 'string') {
    return (chunk !== '')
      ? (acc !== '')
        ? `${acc} ${chunk}`
        : chunk
      : acc;
  } else if (chunkType === 'object') {
    return Object.keys(chunk).reduce(
      (acc, className) => (
        chunk[className] === true
          ? [...acc, className]
          : acc
      ),
      (acc === '' ? [] : [acc])
    ).join(' ');
  } else {
    throw new Error(`CX: invalid chunk type '${chunkType}'`);
  }
}, '');

export const cxTests = makeSuite([
  assertIs(
    'cx() correctly applies optionalClasses',
    () => cx([{
      foo: true,
      bar: false
    }]),
    'foo'
  ),

  assertIs(
    'cx() adds defaultClasses',
    () => cx([{
      foo: true,
    }, 'bar']),
    'foo bar'
  ),

  assertIs(
    'cx() adds defaultClasses when there is no else',
    () => cx([{
      foo: false,
    }, 'bar']),
    'bar'
  ),

  assertIs(
    'cx() allows undefined chunks',
    () => cx([
      'foo bar',
      undefined
    ]),
    'foo bar'
  ),

  assertIs(
    'cx() allows null chunks',
    () => cx([
      'foo bar',
      null
    ]),
    'foo bar'
  ),

  assertIs(
    'cx() handles empty chunks',
    () => cx([
      'foo',
      {},
      'bar',
      '',
      'baz',
      undefined
    ]),
    'foo bar baz'
  )
]);

export const deepEquals = (left, right) => {
  if (left === right) {
    return true;
  }

  const leftType = typeOf(left);
  const rightType = typeOf(right);

  if (leftType.type !== rightType.type) {
    return false;
  } else if (!leftType.isRef) {
    return left === right;
  } else if (leftType.type === 'object') {
    if (Object.keys(left).every(k => Object.keys(right).includes(k))) {
      return Object.keys(left).every(k => (
        deepEquals(left[k], right[k])
      ));
    } else {
      return false;
    }
  } else if (leftType.type === 'array') {
    if (left.length !== right.length) {
      return false;
    } else {
      return left.every((l, idx) => (
        deepEquals(l, right[idx])
      ));
    }
  } else {
    throw new Error(`DEEP_EQUALS: Unhandled type ${leftType.type}`);
  }
};

export const deepEqualsTests = makeSuite([
  assertIs(
    'deepEquals() handles non-equal types',
    () => deepEquals(1, 2),
    false
  ),

  assertIs(
    'deepEquals() handles basic equal types',
    () => deepEquals(1, 1),
    true
  ),

  assertIs(
    'deepEquals() handles non-equal objects',
    () => deepEquals({ foo: 1 }, { foo: 2 }),
    false
  ),

  assertIs(
    'deepEquals() handles equal objects',
    () => deepEquals({ foo: 1 }, { foo: 1 }),
    true
  ),

  assertIs(
    'deepEquals() handles nested objects',
    () => deepEquals({
      foo: {
        bar: {
          baz: 2,
          bit: 1
        }
      }
    }, {
      foo: {
        bar: {
          bit: 1,
          baz: 2
        }
      }
    }),
    true
  ),

  assertIs(
    'deepEquals() handles non-equal arrays',
    () => deepEquals([1, 2], [2, 1]),
    false
  ),

  assertIs(
    'deepEquals() handles equal arrays',
    () => deepEquals([1], [1]),
    true
  ),

  assertIs(
    'deepEquals() handles nested arrays',
    () => deepEquals([
      ['foo', 'bar', 'baz'],
      [1, 2, 3]
    ], [
      ['foo', 'bar', 'baz'],
      [1, 2, 3]
    ]),
    true
  ),

  assertIs(
    'deepEquals() handles nested object arrays',
    () => deepEquals({
      foo: [1, 2, 3],
      bar: 'foo'
    }, {
      bar: 'foo',
      foo: [1, 2, 3]
    }),
    true
  ),

  assertIs(
    'deepEquals() handles nested array objects',
    () => deepEquals([
      { foo: 1 },
      { bar: 2 }
    ], [
      { foo: 1 },
      { bar: 2 }
    ]),
    true
  )
]);

export const getDisplayName = Component => (
  Component.displayName || Component.name || 'AnonComponent'
);

export const handleActions = actionCreatorsToHandlers => {
  const handlerMap = Object.keys(actionCreatorsToHandlers).reduce(
    (acc, actionCreator) => ({
      ...acc,
      [actionCreator().type]: actionCreatorsToHandlers[actionCreator]
    }),
    {}
  );

  return (state, action) => (
    handlerMap[action.type]
      ? handlerMap[action.type](state, action.data)
      : state
  );
}

export const mergeData = (stateData, actionData) => ({
  ...stateData,
  ...actionData
});

export const mergeDataTests = makeSuite([
  assertEquals(
    'mergeData() works',
    () => mergeData(
      {
        foo: 2,
        bar: 5
      },
      { foo: 3 }
    ),
    {
      foo: 3,
      bar: 5
    }
  )
]);

const PARAMS_SCHEMA = {
  foo: {
    validate: v => /^[0-9]+$/.test(v),
    parse: v => parseInt(v, 10)
  },
  bar: {
    validate: /^(foo|bar|baz)$/,
  }
};

export const params = {
  get: key => {
    if (!Object.keys(PARAMS_SCHEMA).includes(key)) {
      throw new Error(`Cannot get key "${key}" that does not exist in schema`);
    }
    const validate = PARAMS_SCHEMA[key].validate || (() => true);
    const parse = PARAMS_SCHEMA[key].parse || (v => v);

    const value = (new URL(window.location.href)).searchParams.get(key);
    if (validate(value)) {
      return parse(value);
    } else {
      return;
    }
  },
  set: (key, value) => {

  }
};

export const setField = field => (stateData, actionData) => ({
  ...stateData,
  [field]: actionData
});

export const typeOf = something => {
  if (Array.isArray(something)) {
    return ({
      type: 'array',
      isRef: true
    });
  } else if (something === null) {
    return ({
      type: 'null',
      isRef: false
    });
  } else {
    const type = typeof something;

    return ({
      type,
      isRef: type === 'object'
    });
  }
}

export const typeOfTests = makeSuite([
  assertEquals(
    'typeOf() works for array',
    () => typeOf([3]),
    {
      type: 'array',
      isRef: true
    }
  ),

  assertEquals(
    'typeOf() works for object',
    () => typeOf({ foo: 1 }),
    {
      type: 'object',
      isRef: true
    }
  ),

  assertEquals(
    'typeOf() works for number',
    () => typeOf(2),
    {
      type: 'number',
      isRef: true
    }
  ),

  assertEquals(
    'typeOf() works for null',
    () => typeOf(null),
    {
      type: 'null',
      isRef: true
    }
  ),
]);

export const upperCase = str => (
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
);

export const upperCaseTests = makeSuite([
  assertIs(
    'upperCase() works on "foobar"',
    () => upperCase('foobar'),
    'Foobar'
  ),

  assertIs(
    'upperCase() works on "FOOBAR"',
    () => upperCase('foobar'),
    'Foobar'
  ),

  assertIs(
    'upperCase() works on "f"',
    () => upperCase('f'),
    'F'
  ),

  assertIs(
    'upperCase() works on ""',
    () => upperCase(''),
    ''
  )
]);

export const snakeToCamel = snake => (
  snake
    .split('_')
    .reduce((acc, piece, i) => (
      `${acc}${i === 0 ? piece.toLowerCase() : upperCase(piece)}`
    ), '')
);

export const snakeToCamelTests = makeSuite([
  assertIs(
    'snakeToCamel() works on "foobar"',
    () => snakeToCamel('foo_bar'),
    'fooBar'
  ),

  assertIs(
    'snakeToCamel() works on "FOO_BAR_BAZ"',
    () => snakeToCamel('FOO_BAR_BAZ'),
    'fooBarBaz'
  ),

  assertIs(
    'snakeToCamel() works on "f"',
    () => snakeToCamel('f'),
    'f'
  ),

  assertIs(
    'snakeToCamel() works on ""',
    () => snakeToCamel(''),
    ''
  )
]);
