import React from 'react';

export default function Body(props) {
  const {
    children,
    ...rest,
  } = props;
  return (<p
    style={{
      color: 'black',
      fontSize: '12px',
    }}
  >
    {children}
  </p>);
}
