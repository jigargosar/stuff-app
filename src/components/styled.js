import { Flex } from 'rebass'
import styled, { ThemeProvider } from 'styled-components'
import React from 'react'

export const FCol = styled(Flex)`
  flex-direction: column;
`
export const FColCX = styled(FCol)`
  align-items: center;
`
export const FRow = styled(Flex)`
  flex-direction: row;
`
export const FRowCY = styled(FRow)`
  align-items: center;
`

export const AppThemeProvider = props => {
  return <ThemeProvider theme={styledComponentsTheme} {...props} />
}
export const styledComponentsTheme = {
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
}
