export const renderIfOrElse = (test: boolean, component: JSX.Element, elseComponent: JSX.Element): JSX.Element => {
  if (test) {
    return component
  } else {
    return elseComponent
  }
}

export const renderIf = (test: boolean, component: JSX.Element): JSX.Element => {
  if (test) {
    return component
  }
  return <></>
}
