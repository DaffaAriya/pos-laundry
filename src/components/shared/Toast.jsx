'use client'

import { toast as sonnerToast } from 'sonner'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

export const toast = {
  success: (message, description) => {
    sonnerToast.success(message, {
      description,
      icon: <CheckCircle className="h-5 w-5" />,
    })
  },
  error: (message, description) => {
    sonnerToast.error(message, {
      description,
      icon: <XCircle className="h-5 w-5" />,
    })
  },
  warning: (message, description) => {
    sonnerToast.warning(message, {
      description,
      icon: <AlertCircle className="h-5 w-5" />,
    })
  },
  info: (message, description) => {
    sonnerToast.info(message, {
      description,
      icon: <Info className="h-5 w-5" />,
    })
  },
  promise: (promise, messages) => {
    return sonnerToast.promise(promise, messages)
  },
}

export default toast