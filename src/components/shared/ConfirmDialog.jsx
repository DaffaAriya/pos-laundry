'use client'

import Modal, { ModalFooter } from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'

const icons = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
  danger: XCircle,
}

const iconColors = {
  warning: 'text-yellow-500',
  info: 'text-blue-500',
  success: 'text-green-500',
  danger: 'text-red-500',
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'warning',
  loading = false,
}) {
  const Icon = icons[variant]

  const handleConfirm = async () => {
    await onConfirm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlay={!loading}
      showCloseButton={!loading}
    >
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
          <Icon className={`h-6 w-6 ${iconColors[variant]}`} />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        {message && (
          <p className="text-sm text-gray-600 mb-6">
            {message}
          </p>
        )}
      </div>

      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
          fullWidth
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={handleConfirm}
          loading={loading}
          fullWidth
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}