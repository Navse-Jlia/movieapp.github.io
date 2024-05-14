import React from 'react'
import { Alert } from 'antd'

export default function ErrorIndicator() {
  return (
    <Alert
      message="посмотри лучше АТАКУ ТИТАНОВ, то что ты ищещь не существует"
      type="error"
      showIcon
    />
  )
}
