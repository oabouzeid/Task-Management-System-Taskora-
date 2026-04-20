import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../apiClient';
import { useToast } from '../ToastContext';
import { Plus, Trash2, Layout, Clock, Users, ArrowRight, Edit3 } from 'lucide-react';

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [newBoard, setNewBoard] = useState({ title: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await apiClient.get('/boards');
      if (response.ok) {
        const data = await response.json();
        setBoards(data.boards || []);
      } else {
          showToast('Failed to load boards', 'danger');
      }
    } catch (err) {
      console.error('Fetch boards error', err);
      showToast('Connection error', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      let response;
      if (editingBoard) {
        response = await apiClient.put(`/boards/${editingBoard._id}`, newBoard);
      } else {
        response = await apiClient.post('/boards', newBoard);
      }
      
      if (response.ok) {
        setShowModal(false);
        setEditingBoard(null);
        setNewBoard({ title: '', description: '' });
        fetchBoards();
        showToast(editingBoard ? 'Board updated!' : 'Board created successfully!', 'success');
      } else {
        showToast('Failed to save board', 'danger');
      }
    } catch (err) {
      console.error('Save board error', err);
      showToast('Error saving board', 'danger');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditClick = (board, e) => {
      e.preventDefault();
      e.stopPropagation();
      setEditingBoard(board);
      setNewBoard({ title: board.title, description: board.description });
      setShowModal(true);
  };

  const handleDeleteBoard = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this board?')) return;
    try {
      const resp = await apiClient.delete(`/boards/${id}`);
      if (resp.ok) {
          fetchBoards();
          showToast('Board deleted', 'info');
      }
    } catch (err) {
      console.error('Delete board error', err);
      showToast('Error deleting board', 'danger');
    }
  };

  if (loading) {
    return (
      <div className="row g-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="col-12 col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4" style={{ height: 180 }}>
              <div className="placeholder-glow">
                <span className="placeholder col-6 mb-2"></span>
                <span className="placeholder col-12 mb-4"></span>
                <span className="placeholder col-4"></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="fw-bold h2 mb-1">My Boards</h1>
          <p className="text-muted">Manage your projects and teams in one place</p>
        </div>
        <button 
          className="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
          onClick={() => { setEditingBoard(null); setNewBoard({title:'', description:''}); setShowModal(true); }}
        >
          <Plus size={20} />
          Create Board
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="text-center py-5 glass rounded-5 border-0">
          <div className="bg-primary-subtle text-primary p-4 rounded-circle d-inline-flex mb-4">
            <Layout size={40} />
          </div>
          <h3 className="fw-bold">No Boards Yet</h3>
          <p className="text-muted mb-4 text-center mx-auto" style={{ maxWidth: 400 }}>
            Ready to get organized? Create your first project board and start tracking tasks with your team.
          </p>
          <button className="btn btn-primary rounded-pill px-5 py-2" onClick={() => setShowModal(true)}>
            Get Started
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {boards.map(board => (
            <div key={board._id} className="col-12 col-md-6 col-lg-4">
              <Link to={`/boards/${board._id}`} className="card border-0 shadow-sm rounded-5 overflow-hidden board-card h-100 glass text-decoration-none">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                      <Layout size={24} />
                    </div>
                    <div className="d-flex gap-1">
                      <button className="btn btn-link text-muted p-1 hover-primary" onClick={(e) => handleEditClick(board, e)}>
                        <Edit3 size={18} />
                      </button>
                      <button className="btn btn-link text-muted p-1 hover-danger" onClick={(e) => handleDeleteBoard(e, board._id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <h3 className="h5 fw-bold mb-2 text-truncate pe-4">{board.title}</h3>
                  <p className="small text-muted flex-grow-1 mb-4 line-clamp-2">
                    {board.description || 'No description provided for this board.'}
                  </p>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top border-opacity-10 border-dark mt-auto">
                    <div className="d-flex align-items-center gap-3">
                       <span className="small d-flex align-items-center gap-1 text-muted">
                        <Users size={14} /> {board.members?.length || 0}
                       </span>
                       <span className="small d-flex align-items-center gap-1 text-muted">
                        <Clock size={14} /> {new Date(board.updatedAt).toLocaleDateString()}
                       </span>
                    </div>
                    <ArrowRight size={18} className="text-primary arrow-icon" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Board Modal */}
      {showModal && (
        <div className="modal show d-block glass" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-3 rounded-5 bg-secondary-subtle">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{editingBoard ? 'Edit Board' : 'New Board'}</h5>
                <button type="button" className="btn-close" onClick={() => { setShowModal(false); setEditingBoard(null); }}></button>
              </div>
              <form onSubmit={handleCreateBoard}>
                <div className="modal-body py-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Board Title</label>
                    <input 
                      type="text" 
                      className="form-control rounded-4 py-2 glass" 
                      placeholder="e.g. Website Rebuild"
                      value={newBoard.title}
                      onChange={(e) => setNewBoard({...newBoard, title: e.target.value})}
                      required 
                      autoFocus
                    />
                  </div>
                  <div className="mb-0">
                    <label className="form-label small fw-bold">Description</label>
                    <textarea 
                        className="form-control rounded-4 py-2 glass" 
                        placeholder="What is this board about?"
                        rows="3"
                        value={newBoard.description}
                        onChange={(e) => setNewBoard({...newBoard, description: e.target.value})}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-link text-muted" onClick={() => { setShowModal(false); setEditingBoard(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 rounded-pill fw-bold" disabled={isCreating}>
                    {isCreating ? 'Saving...' : (editingBoard ? 'Update Board' : 'Create Board')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .board-card {
          transition: transform var(--transition-speed), box-shadow var(--transition-speed);
        }
        .board-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--card-hover-shadow) !important;
        }
        .hover-primary:hover { color: var(--accent-primary) !important; }
        .hover-danger:hover { color: #dc3545 !important; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .arrow-icon {
          transition: transform var(--transition-speed);
        }
        .board-card:hover .arrow-icon {
          transform: translateX(5px);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
