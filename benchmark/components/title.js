import React from 'react';

export default function Title(props) {
  const {
    children,
    ...rest,
  } = props;
  return (<h1
    style={{
      color: 'black',
      fontSize: '42px',
      fontWeight: 'bold',
    }}
  >
    {children}
  </h1>);
}
