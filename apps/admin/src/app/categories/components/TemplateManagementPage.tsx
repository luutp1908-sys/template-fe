import React from 'react'

export default function TemplateManagementPage() {
  return (
    <section className="template-page">
      <div className="template-card">
        <h2>Template Management</h2>
        <p>
          This section is ready for template listing, search, filtering, and actions.
          Use the Categories tab anytime to continue category tree management.
        </p>
        <button type="button" className="primary-btn">
          Create Template
        </button>
      </div>
    </section>
  )
}
