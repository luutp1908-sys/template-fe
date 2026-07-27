import React, { useState } from 'react'
import CreateTemplateModal from './CreateTemplateModal'

export default function TemplateManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  return (
    <section className="template-page">
      <div className="template-card">
        <h2>Template Management</h2>
        <p>
          Create template metadata from this section. The template id is generated on the backend,
          then metadata is persisted to the mock JSON storage.
        </p>

        {successMessage ? <div className="form-success">{successMessage}</div> : null}

        <button
          type="button"
          className="primary-btn"
          onClick={() => {
            setSuccessMessage(null)
            setIsModalOpen(true)
          }}
        >
          Create Template
        </button>
      </div>

      <CreateTemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(createdTitle) => {
          setSuccessMessage(`Template \"${createdTitle}\" created successfully.`)
        }}
      />
    </section>
  )
}
