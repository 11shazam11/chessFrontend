import React from 'react'
import styles from './updatecreate.module.css';
import { useNavigate } from 'react-router-dom';

const UpdateCreate = (props) => {
  const { mode, onClose, tournamentData, onSubmit } = props;
  // mode: 'create' or 'update'

  const navigate = useNavigate();
  
  // Helper function to format date for input[type="date"]
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [formData, setFormData] = React.useState({
    name: tournamentData?.name || '',
    description: tournamentData?.description || '',
    start_date: formatDateForInput(tournamentData?.start_date) || '',
    end_date: formatDateForInput(tournamentData?.end_date) || '',
    time_control: tournamentData?.time_control || '',
    max_players: tournamentData?.max_players || '',
    status: tournamentData?.status || 'draft'
  });

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'registration_open', label: 'Registration Open' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const serverUrl = import.meta.env.VITE_SERVER_URL;
    console.log(`tournamnet id : ${tournamentData?.id} tournament status: ${formData.status}`);
    const endpoint = mode === 'create' 
      ? `${serverUrl}/api/tournaments/register` 
      : `${serverUrl}/api/tournaments/${tournamentData.id}/status/${formData.status}`;
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        navigate("/tournaments");
        if (onSubmit) onSubmit(data);
        onClose();
      } else {
        console.log('Failed to save tournament');
      }
    } catch (error) {
      console.error('Error saving tournament:', error);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{mode === 'create' ? 'Create Tournament' : 'Update Tournament'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Tournament Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter tournament name"
              className={styles.inputField}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter tournament description"
              className={styles.textareaField}
              rows="4"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={styles.selectField}
              required
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.dateRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={styles.inputField}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={styles.inputField}
                required
              />
            </div>
          </div>

          <div className={styles.dateRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Time Control</label>
              <input
                type="text"
                name="time_control"
                value={formData.time_control}
                onChange={handleChange}
                placeholder="e.g., 10-10"
                className={styles.inputField}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Max Players</label>
              <input
                type="number"
                name="max_players"
                value={formData.max_players}
                onChange={handleChange}
                placeholder="Enter max players"
                className={styles.inputField}
                min="2"
                required
              />
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary}>
              {mode === 'create' ? 'Create Tournament' : 'Update Tournament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateCreate