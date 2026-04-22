import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../apiClient';
import { useToast } from '../ToastContext';
import { Plus, MoreVertical, Trash2, CheckCircle, MessageSquare, User, Calendar, Edit3, X, ArrowRight, Activity, Users, UserPlus, UserMinus, Clock, Layout, ChevronRight, Filter } from 'lucide-react';

const BoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [tasksByList, setTasksByList] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modals / State for creation
  const [showListModal, setShowListModal] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeListId, setActiveListId] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'todo' });

  // Task Details Modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskEditData, setTaskEditData] = useState({ title: '', description: '', dueDate: '' });
  const [newComment, setNewComment] = useState('');
  
  // Board Members Modal
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [memberLoading, setMemberLoading] = useState(false);

  useEffect(() => {
    fetchBoardData();
  }, [id, filterStatus]);

  const fetchBoardData = async () => {
    try {
      const boardRes = await apiClient.get(`/boards/${id}`);
      if (boardRes.ok) {
        const boardData = await boardRes.json();
        setBoard(boardData);
      } else {
        navigate('/');
        return;
      }

      const listsRes = await apiClient.get(`/boards/${id}/lists`);
      if (listsRes.ok) {
        const { lists: listsData } = await listsRes.json();
        setLists(listsData);
        
        // Fetch tasks for each list
        const tasksMap = {};
        for (const list of listsData) {
            let url = `/boards/${id}/lists/${list._id}/tasks`;
            if (filterStatus !== 'all') {
                url += `?status=${filterStatus}`;
            }
            const taskRes = await apiClient.get(url);
            if (taskRes.ok) {
                const data = await taskRes.json();
                tasksMap[list._id] = data.tasks || [];
            }
        }
        setTasksByList(tasksMap);
      }
    } catch (err) {
      console.error('Fetch board data error', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskDetail = async (taskId, listId) => {
    try {
      const response = await apiClient.get(`/boards/${id}/lists/${listId}/tasks/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedTask(data);
        setTaskEditData({
          title: data.title,
          description: data.description || '',
          dueDate: data.dueDate ? data.dueDate.split('T')[0] : ''
        });
      }
    } catch (err) {
      console.error('Fetch task detail error', err);
    }
  };

  const fetchAllUsers = async () => {
    setMemberLoading(true);
    try {
      const response = await apiClient.get('/users');
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data.users || []);
      }
    } catch (err) {
      console.error('Fetch users error', err);
    } finally {
      setMemberLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post(`/boards/${id}/lists`, { title: newListTitle });
      if (response.ok) {
        setShowListModal(false);
        setNewListTitle('');
        fetchBoardData();
      }
    } catch (err) {
      console.error('Create list error', err);
    }
  };

  const handleDeleteList = async (listId) => {
      if (!confirm('Are you sure you want to delete this list and all its tasks?')) return;
      try {
          await apiClient.delete(`/boards/${id}/lists/${listId}`);
          fetchBoardData();
      } catch (err) {
          console.error('Delete list error', err);
      }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post(`/boards/${id}/lists/${activeListId}/tasks`, newTask);
      if (response.ok) {
        setShowTaskModal(false);
        setNewTask({ title: '', description: '' });
        fetchBoardData();
      }
    } catch (err) {
      console.error('Create task error', err);
    }
  };

  const handleUpdateTaskStatus = async (taskId, listId, newStatus) => {
    try {
      await apiClient.patch(`/boards/${id}/lists/${listId}/tasks/${taskId}/status`, { status: newStatus });
      fetchBoardData();
      if (selectedTask && selectedTask._id === taskId) {
          setSelectedTask({...selectedTask, status: newStatus});
      }
    } catch (err) {
      console.error('Update status error', err);
    }
  };

  const handleUpdateTaskDetails = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.patch(`/boards/${id}/lists/${selectedTask.list}/tasks/${selectedTask._id}`, taskEditData);
      if (response.ok) {
        const data = await response.json();
        setSelectedTask(data.task);
        setIsEditingTask(false);
        fetchBoardData();
      }
    } catch (err) {
      console.error('Update task details error', err);
    }
  };

  const handleAssignTask = async (userId) => {
      try {
          const response = await apiClient.post(`/boards/${id}/lists/${selectedTask.list}/tasks/${selectedTask._id}/assign`, { userId });
          if (response.ok) {
              fetchTaskDetail(selectedTask._id, selectedTask.list);
              fetchBoardData();
          }
      } catch (err) {
          console.error('Assign task error', err);
      }
  };

  const handleDeleteTask = async (taskId) => {
      if (!confirm('Are you sure you want to delete this task?')) return;
      try {
          const response = await apiClient.delete(`/boards/${id}/lists/${selectedTask.list}/tasks/${taskId}`);
          if (response.ok) {
              setSelectedTask(null);
              fetchBoardData();
          }
      } catch (err) {
          console.error('Delete task error', err);
      }
  };

  const handleAddComment = async (e) => {
      e.preventDefault();
      if (!newComment.trim()) return;
      try {
          const response = await apiClient.post(`/boards/${id}/lists/${selectedTask.list}/tasks/${selectedTask._id}/comments`, { content: newComment });
          if (response.ok) {
              setNewComment('');
              fetchTaskDetail(selectedTask._id, selectedTask.list);
              fetchBoardData(); 
          }
      } catch (err) {
          console.error('Add comment error', err);
      }
  };

  const handleDeleteComment = async (cId) => {
      if (!confirm('Delete this comment?')) return;
      try {
          const response = await apiClient.delete(`/boards/${id}/lists/${selectedTask.list}/tasks/${selectedTask._id}/comments/${cId}`);
          if (response.ok) {
              fetchTaskDetail(selectedTask._id, selectedTask.list);
              fetchBoardData();
          }
      } catch (err) {
          console.error('Delete comment error', err);
      }
  };

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentEditContent, setCommentEditContent] = useState('');

  const handleUpdateComment = async (cId) => {
      if (!commentEditContent.trim()) return;
      try {
          const response = await apiClient.patch(`/boards/${id}/lists/${selectedTask.list}/tasks/${selectedTask._id}/comments/${cId}`, { content: commentEditContent });
          if (response.ok) {
              setEditingCommentId(null);
              fetchTaskDetail(selectedTask._id, selectedTask.list);
          }
      } catch (err) {
          console.error('Update comment error', err);
      }
  };

  const handleAddMember = async (userId) => {
      try {
          const response = await apiClient.post(`/boards/${id}/members`, { userId });
          if (response.ok) {
              fetchBoardData();
              showToast?.('Member added', 'success');
          }
      } catch (err) {
          console.error('Add member error', err);
      }
  };

  const handleRemoveMember = async (userId) => {
      if (!confirm('Remove this member from the board?')) return;
      try {
          const response = await apiClient.delete(`/boards/${id}/members/${userId}`);
          if (response.ok) {
              fetchBoardData();
              showToast?.('Member removed', 'info');
          }
      } catch (err) {
          console.error('Remove member error', err);
      }
  };

  if (loading) return <div className="text-center py-5">Loading Board...</div>;
  if (!board) return <div className="text-center py-5">Board not found.</div>;

  return (
    <div className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item small"><Link to="/">Boards</Link></li>
              <li className="breadcrumb-item active small" aria-current="page">{board.title}</li>
            </ol>
          </nav>
          <h1 className="fw-bold h3 mb-0">{board.title}</h1>
          <p className="text-muted small mb-0">{board.description || 'Project Workspace'}</p>
        </div>
        <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-1 me-2 pt-1">
                {board.members?.slice(0, 3).map(m => (
                    <div key={m._id} className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center border border-white" style={{ width: 32, height: 32, fontSize: 12, marginLeft: -8 }} title={m.name}>
                        {m.name?.charAt(0).toUpperCase()}
                    </div>
                ))}
                {board.members?.length > 3 && (
                    <div className="bg-secondary-subtle text-muted rounded-circle d-flex align-items-center justify-content-center small border border-white" style={{ width: 32, height: 32, marginLeft: -8 }}>
                        +{board.members.length - 3}
                    </div>
                )}
                <button 
                  className="btn btn-outline-secondary rounded-circle p-0 d-flex align-items-center justify-content-center ms-2" 
                  style={{ width: 32, height: 32 }}
                  onClick={() => { setShowMembersModal(true); fetchAllUsers(); }}
                >
                  <UserPlus size={16} />
                </button>
            </div>
            <div className="dropdown">
                <button className="btn btn-outline-secondary rounded-pill px-3 py-2 small shadow-sm d-flex align-items-center gap-2 fw-bold bg-white glass" data-bs-toggle="dropdown">
                    <Filter size={16} /> 
                    {filterStatus === 'all' ? 'All Tasks' : filterStatus === 'todo' ? 'To Do' : filterStatus === 'inProgress' ? 'In Progress' : 'Done'}
                </button>
                <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg p-2 rounded-4">
                    <li><button className={`dropdown-item rounded-3 small py-2 ${filterStatus === 'all' ? 'bg-primary-subtle text-primary fw-bold' : ''}`} onClick={() => setFilterStatus('all')}>All Tasks</button></li>
                    <li><button className={`dropdown-item rounded-3 small py-2 ${filterStatus === 'todo' ? 'bg-info-subtle text-info fw-bold' : ''}`} onClick={() => setFilterStatus('todo')}>To Do</button></li>
                    <li><button className={`dropdown-item rounded-3 small py-2 ${filterStatus === 'inProgress' ? 'bg-warning-subtle text-warning fw-bold' : ''}`} onClick={() => setFilterStatus('inProgress')}>In Progress</button></li>
                    <li><button className={`dropdown-item rounded-3 small py-2 ${filterStatus === 'done' ? 'bg-success-subtle text-success fw-bold' : ''}`} onClick={() => setFilterStatus('done')}>Done</button></li>
                </ul>
            </div>
            <button className="btn btn-primary rounded-pill px-4 py-2 small shadow-sm d-flex align-items-center gap-2 fw-bold" onClick={() => setShowListModal(true)}>
                <Plus size={18} /> Add List
            </button>
        </div>
      </div>

      <div className="board-canvas d-flex gap-4 overflow-auto pb-4" style={{ minHeight: 'calc(100vh - 250px)' }}>
        {lists.map(list => (
          <div key={list._id} className="list-column flex-shrink-0" style={{ width: 300 }}>
            <div className="card border-0 glass rounded-4 h-100 shadow-sm overflow-hidden">
              <div className="card-header border-0 bg-transparent p-3 d-flex justify-content-between align-items-center">
                <h6 className="fw-bold mb-0">{list.title}</h6>
                <div className="dropdown">
                  <button className="btn btn-link text-muted p-0" data-bs-toggle="dropdown">
                    <MoreVertical size={16} />
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg p-2 rounded-3">
                    <li><button className="dropdown-item text-danger small py-2 rounded-2" onClick={() => handleDeleteList(list._id)}>Delete List</button></li>
                  </ul>
                </div>
              </div>
              <div className="card-body p-2 d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: 'calc(100vh - 350px)' }}>
                {(tasksByList[list._id] || []).map(task => (
                  <div 
                    key={task._id} 
                    className={`task-card p-3 rounded-4 shadow-sm border-0 d-flex flex-column gap-2 ${task.status === 'done' ? 'opacity-50' : ''}`}
                    style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="form-check-input flex-shrink-0 m-0" 
                        checked={task.status === 'done'}
                        onChange={(e) => handleUpdateTaskStatus(task._id, list._id, e.target.checked ? 'done' : 'todo')}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <h6 
                        className={`fw-semibold mb-0 flex-grow-1 cursor-pointer ${task.status === 'done' ? 'text-decoration-line-through text-muted' : ''}`}
                        onClick={() => fetchTaskDetail(task._id, list._id)}
                      >
                        {task.title}
                      </h6>
                      <div 
                        className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 cursor-pointer shadow-sm" 
                        style={{ width: 28, height: 28, fontSize: 12 }}
                        onClick={() => fetchTaskDetail(task._id, list._id)}
                      >
                        {task.assignedTo?.name?.charAt(0).toUpperCase() || (task.assignedTo ? '?' : <User size={14}/>)}
                      </div>
                    </div>
                    
                      <div className="d-flex align-items-center gap-3">
                        <span className={`badge rounded-pill fw-normal px-2 py-0 small ${
                          task.status === 'todo' ? 'bg-info-subtle text-info' : 
                          task.status === 'inProgress' ? 'bg-warning-subtle text-warning' : 
                          'bg-success-subtle text-success'
                        }`} style={{ fontSize: 10 }}>
                          {task.status === 'inProgress' ? 'In Progress' : task.status.toUpperCase()}
                        </span>
                        {task.dueDate && (
                          <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: 10 }}>
                            <Calendar size={11} className="text-danger opacity-75"/> {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                        <div className="ms-auto d-flex gap-2">
                          {task.comments?.length > 0 && (
                            <div className="text-muted small d-flex align-items-center gap-1" style={{ fontSize: 11 }}>
                               <MessageSquare size={12}/> {task.comments.length}
                            </div>
                          )}
                          {task.activity?.length > 0 && (
                             <div className="text-muted small d-flex align-items-center gap-1" style={{ fontSize: 11 }}>
                               <Activity size={12}/>
                            </div>
                          )}
                        </div>
                      </div>
                  </div>
                ))}
                <button 
                  className="btn btn-link text-muted py-2 small d-flex align-items-center gap-2 justify-content-center text-decoration-none border-dashed-hover rounded-3"
                  onClick={() => { setActiveListId(list._id); setShowTaskModal(true); }}
                >
                  <Plus size={16} /> Add Task
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="list-column flex-shrink-0" style={{ width: 300 }}>
            <button 
                className="btn w-100 rounded-4 py-4 text-muted border-dashed d-flex align-items-center justify-content-center gap-2"
                style={{ backgroundColor: 'transparent', borderColor: 'var(--border-color)', borderStyle: 'dashed', borderWidth: 2 }}
                onClick={() => setShowListModal(true)}
            >
                <Plus size={20} /> Add Another List
            </button>
        </div>
      </div>

      {/* List Create Modal */}
      {showListModal && (
        <div className="modal show d-block glass" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered mt-0">
            <div className="modal-content border-0 shadow-lg p-3 rounded-5 bg-secondary-subtle">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">New List</h5>
                <button type="button" className="btn-close" onClick={() => setShowListModal(false)}></button>
              </div>
              <form onSubmit={handleCreateList}>
                <div className="modal-body py-4">
                  <div className="mb-0">
                    <label className="form-label small fw-semibold">List Title</label>
                    <input 
                      type="text" 
                      className="form-control rounded-4 py-2 glass" 
                      placeholder="e.g. To Do, Done, Review"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      required 
                      autoFocus
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-link text-muted" onClick={() => setShowListModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 rounded-pill fw-bold">Create List</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Task Create Modal */}
      {showTaskModal && (
        <div className="modal show d-block glass" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered mt-0">
            <div className="modal-content border-0 shadow-lg p-3 rounded-5 bg-secondary-subtle">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">New Task</h5>
                <button type="button" className="btn-close" onClick={() => setShowTaskModal(false)}></button>
              </div>
              <form onSubmit={handleCreateTask}>
                <div className="modal-body py-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Task Title</label>
                    <input 
                      type="text" 
                      className="form-control rounded-4 py-2 glass" 
                      placeholder="e.g. Design Login Page"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      required 
                      autoFocus
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea 
                        className="form-control rounded-4 py-2 glass" 
                        placeholder="Details about this task..."
                        rows="3"
                        value={newTask.description}
                        onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    ></textarea>
                  </div>
                  <div>
                    <label className="form-label small fw-semibold">Initial Status</label>
                    <select 
                        className="form-select rounded-4 py-2 glass"
                        value={newTask.status}
                        onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                    >
                        <option value="todo">To Do</option>
                        <option value="inProgress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-link text-muted" onClick={() => setShowTaskModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 rounded-pill fw-bold">Create Task</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Task Details / Edit Modal */}
      {selectedTask && (
          <div className="modal show d-block glass" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered mt-0">
              <div className="modal-content border-0 shadow-lg p-0 rounded-5 bg-secondary-subtle overflow-hidden">
                <div className="p-4 bg-primary text-white position-relative">
                    <button type="button" className="btn-close btn-close-white position-absolute top-0 end-0 m-4" onClick={() => setSelectedTask(null)}></button>
                    <div className="pe-5">
                        <span className={`badge rounded-pill fw-bold px-3 py-2 mb-2 bg-white bg-opacity-25 text-white`} style={{ fontSize: 11 }}>
                            {selectedTask.status === 'inProgress' ? 'IN PROGRESS' : selectedTask.status.toUpperCase()}
                        </span>
                        {isEditingTask ? (
                            <form onSubmit={handleUpdateTaskDetails}>
                                <input 
                                    className="form-control form-control-lg bg-white bg-opacity-10 text-white border-0 fw-bold mb-2 p-0 px-2"
                                    value={taskEditData.title}
                                    onChange={(e) => setTaskEditData({...taskEditData, title: e.target.value})}
                                    autoFocus
                                />
                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-light btn-sm rounded-pill px-3 fw-bold">Save</button>
                                    <button type="button" className="btn btn-link btn-sm text-white text-decoration-none" onClick={() => setIsEditingTask(false)}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <div className="d-flex align-items-center gap-3">
                                <h3 className="h4 fw-bold mb-0">{selectedTask.title}</h3>
                                <button className="btn btn-link btn-sm text-white p-0 opacity-75 hover-opacity-100" onClick={() => setIsEditingTask(true)}>
                                    <Edit3 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-body p-4 p-md-5 row g-4">
                    <div className="col-12 col-lg-8">
                        <section className="mb-5">
                            <h6 className="fw-bold d-flex align-items-center gap-2 mb-3 text-primary">
                                <Edit3 size={18} /> Description
                            </h6>
                            {isEditingTask ? (
                                <textarea 
                                    className="form-control rounded-4 py-3 glass" 
                                    rows="4"
                                    value={taskEditData.description}
                                    onChange={(e) => setTaskEditData({...taskEditData, description: e.target.value})}
                                ></textarea>
                            ) : (
                                <p className="bg-secondary bg-opacity-10 p-3 p-md-4 rounded-4 small">
                                    {selectedTask.description || 'No description provided.'}
                                </p>
                            )}
                        </section>

                        <section className="mb-5">
                            <h6 className="fw-bold d-flex align-items-center gap-2 mb-3 text-primary">
                                <MessageSquare size={18} /> Comments
                            </h6>
                            <div className="comments-list mb-4 d-flex flex-column gap-3">
                                {selectedTask.comments?.length > 0 ? (
                                    selectedTask.comments.map(comment => (
                                        <div key={comment._id} className="d-flex gap-3 fade-in group">
                                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style={{ width: 36, height: 36, fontSize: 14 }}>
                                                {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex-grow-1 bg-white bg-opacity-25 p-3 rounded-4 glass border-0 shadow-sm relative">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span className="fw-bold small">{comment.user?.name || 'User'}</span>
                                                    <div className="d-flex align-items-center gap-2 opacity-50 group-hover-opacity-100">
                                                        <span className="x-small text-muted">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                        <button className="btn btn-link p-0 text-primary" onClick={() => { setEditingCommentId(comment._id); setCommentEditContent(comment.content); }}>
                                                            <Edit3 size={11} />
                                                        </button>
                                                        <button className="btn btn-link p-0 text-danger" onClick={() => handleDeleteComment(comment._id)}>
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                                {editingCommentId === comment._id ? (
                                                    <div className="d-flex gap-2 mt-2">
                                                        <input 
                                                            className="form-control form-control-sm rounded-pill px-3" 
                                                            value={commentEditContent}
                                                            onChange={(e) => setCommentEditContent(e.target.value)}
                                                            autoFocus
                                                        />
                                                        <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => handleUpdateComment(comment._id)}>OK</button>
                                                        <button className="btn btn-link btn-sm text-decoration-none" onClick={() => setEditingCommentId(null)}>Cancel</button>
                                                    </div>
                                                ) : (
                                                    <p className="mb-0 small">{comment.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="small text-muted py-2">No comments yet.</p>
                                )}
                            </div>
                            <form onSubmit={handleAddComment}>
                                <div className="d-flex gap-2">
                                    <input 
                                        type="text" 
                                        className="form-control rounded-pill px-4 py-2 border-0 shadow-sm" 
                                        placeholder="Write a comment..."
                                        style={{ backgroundColor: 'var(--bg-tertiary)' }}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <button className="btn btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center flex-shrink-0 shadow-lg" style={{ width: 44, height: 44 }}>
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section>
                            <h6 className="fw-bold d-flex align-items-center gap-2 mb-3 text-primary">
                                <Activity size={18} /> Recent Activity
                            </h6>
                            <div className="activity-timeline ps-3 border-start ms-2 py-2 d-flex flex-column gap-3">
                                {selectedTask.activity?.length > 0 ? (
                                    selectedTask.activity.slice().reverse().map((act, i) => (
                                        <div key={i} className="activity-item position-relative ps-4">
                                            <div className="position-absolute start-0 top-0 mt-1 bg-primary rounded-circle" style={{ width: 8, height: 8, marginLeft: -17 }}></div>
                                            <div className="small">
                                                <span className="fw-bold">{act.user?.name || 'User'}</span> 
                                                <span className="text-muted ms-2">{act.action}</span>
                                            </div>
                                            <div className="x-small text-muted opacity-75">{new Date(act.timestamp).toLocaleString()}</div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="small text-muted">No activity logged.</p>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="col-12 col-lg-4">
                        <div className="card border-0 rounded-5 bg-white bg-opacity-25 shadow-sm p-4 mb-4">
                            <label className="form-label small fw-bold text-muted text-uppercase mb-3 d-block ls-1">Assignment</label>
                            <div className="dropdown w-100 mb-3">
                                <button className="btn btn-light w-100 rounded-pill text-start py-2 px-3 d-flex align-items-center justify-content-between shadow-sm overflow-hidden" data-bs-toggle="dropdown">
                                    <div className="d-flex align-items-center gap-2 overflow-hidden">
                                        <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, fontSize: 12 }}>
                                            {selectedTask.assignedTo?.name?.charAt(0).toUpperCase() || <User size={12}/>}
                                        </div>
                                        <span className="small text-truncate">{selectedTask.assignedTo?.name || 'Unassigned'}</span>
                                    </div>
                                    <MoreVertical size={14} className="text-muted"/>
                                </button>
                                <ul className="dropdown-menu w-100 border-0 shadow-lg p-2 rounded-4">
                                    <li><button className="dropdown-item rounded-3 small py-2 d-flex align-items-center gap-2" onClick={() => handleAssignTask(null)}><X size={14}/> Unassign</button></li>
                                    <li><hr className="dropdown-divider opacity-50"/></li>
                                    {board.members?.map(m => (
                                        <li key={m._id}>
                                            <button 
                                                className={`dropdown-item rounded-3 small py-2 d-flex align-items-center gap-2 ${selectedTask.assignedTo?._id === m._id ? 'bg-primary-subtle' : ''}`}
                                                onClick={() => handleAssignTask(m._id)}
                                            >
                                                <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 20, height: 20, fontSize: 10 }}>{m.name.charAt(0).toUpperCase()}</div>
                                                {m.name} {selectedTask.assignedTo?._id === m._id && <CheckCircle size={14} className="ms-auto text-primary" />}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <label className="form-label small fw-bold text-muted text-uppercase mb-3 d-block ls-1">Dates</label>
                            <div className="d-flex align-items-center gap-3 small mb-2 ps-1">
                                <Calendar size={16} className="text-primary opacity-50" />
                                <span className="text-muted">Due:</span>
                                {isEditingTask ? (
                                    <input 
                                        type="date" 
                                        className="form-control form-control-sm rounded-3 py-0 border-0 glass small w-auto"
                                        value={taskEditData.dueDate}
                                        onChange={(e) => setTaskEditData({...taskEditData, dueDate: e.target.value})}
                                    />
                                ) : (
                                    <span className="fw-bold">{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'None'}</span>
                                )}
                            </div>
                             <div className="d-flex align-items-center gap-3 small ps-1">
                                <Clock size={16} className="text-primary opacity-50" />
                                <span className="text-muted">Created:</span>
                                <span className="fw-bold">{new Date(selectedTask.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="px-1">
                             <label className="form-label small fw-bold text-muted text-uppercase mb-3 d-block ls-1">Status Actions</label>
                             <div className="d-flex flex-column gap-2">
                                {selectedTask.status !== 'todo' && (
                                    <button className="btn btn-outline-info btn-sm rounded-pill text-start px-3 py-2 d-flex align-items-center justify-content-between" onClick={() => handleUpdateTaskStatus(selectedTask._id, selectedTask.list || selectedTask.listId, 'todo')}>
                                        <span>Move to Todo</span> <Clock size={14} />
                                    </button>
                                )}
                                {selectedTask.status !== 'inProgress' && (
                                    <button className="btn btn-outline-warning btn-sm rounded-pill text-start px-3 py-2 d-flex align-items-center justify-content-between" onClick={() => handleUpdateTaskStatus(selectedTask._id, selectedTask.list || selectedTask.listId, 'inProgress')}>
                                        <span>In Progress</span> <Activity size={14} />
                                    </button>
                                )}
                                {selectedTask.status !== 'done' && (
                                    <button className="btn btn-outline-success btn-sm rounded-pill text-start px-3 py-2 d-flex align-items-center justify-content-between" onClick={() => handleUpdateTaskStatus(selectedTask._id, selectedTask.list || selectedTask.listId, 'done')}>
                                        <span>Mark as Done</span> <CheckCircle size={14} />
                                    </button>
                                )}
                                <hr className="my-2 opacity-50" />
                                <button className="btn btn-outline-danger btn-sm rounded-pill text-start px-3 py-2 d-flex align-items-center justify-content-between" onClick={() => handleDeleteTask(selectedTask._id)}>
                                    <span>Delete Task</span> <Trash2 size={14} />
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
      )}

      {/* Board Members Modal */}
      {showMembersModal && (
        <div className="modal show d-block glass" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-3 rounded-5 bg-secondary-subtle">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Board Members</h5>
                <button type="button" className="btn-close" onClick={() => setShowMembersModal(false)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="mb-4">
                    <label className="form-label small fw-bold">Invite New Member</label>
                    <div className="position-relative">
                        {memberLoading ? <div className="spinner-border spinner-border-sm text-primary position-absolute top-50 end-0 me-3 translate-middle-y"></div> : (
                            <select className="form-select rounded-pill px-4 glass" onChange={(e) => e.target.value && handleAddMember(e.target.value)} value="">
                                <option value="">Search users by email...</option>
                                {allUsers
                                  .filter(u => !board.members.find(m => m._id === u._id) && u._id !== board.owner?._id)
                                  .map(u => (
                                    <option key={u._id} value={u._id}>{u.email} ({u.name})</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                <h6 className="fw-bold mb-3 small text-uppercase ls-1 text-muted">Current Team</h6>
                <div className="d-flex flex-column gap-2">
                    <div className="d-flex align-items-center justify-content-between bg-white bg-opacity-25 p-2 rounded-4 px-3 border border-primary border-opacity-25 shadow-sm">
                        <div className="d-flex align-items-center gap-3">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, fontSize: 13 }}>{board.owner?.name?.charAt(0).toUpperCase()}</div>
                            <div>
                                <span className="small fw-bold d-block">{board.owner?.name} (Owner)</span>
                                <span className="x-small text-muted">{board.owner?.email}</span>
                            </div>
                        </div>
                    </div>
                    {board.members?.map(member => (
                        <div key={member._id} className="d-flex align-items-center justify-content-between bg-white bg-opacity-25 p-2 rounded-4 px-3 border border-dark border-opacity-10">
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, fontSize: 13 }}>{member.name?.charAt(0).toUpperCase()}</div>
                                <div className="overflow-hidden pe-2" style={{ maxWidth: 180 }}>
                                    <span className="small fw-bold d-block text-truncate">{member.name}</span>
                                    <span className="x-small text-muted text-truncate d-block">{member.email}</span>
                                </div>
                            </div>
                            <button className="btn btn-link btn-sm text-danger hvr-grow" onClick={() => handleRemoveMember(member._id)}>
                                <UserMinus size={16} />
                            </button>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .board-canvas {
          padding-bottom: 2rem;
        }
        .task-card {
            cursor: pointer;
            transition: all var(--transition-speed);
        }
        .task-card:hover {
            transform: scale(1.02);
            background-color: var(--bg-tertiary) !important;
        }
        .border-dashed {
            border: 2px dashed var(--border-color);
            background: transparent;
        }
        .border-dashed-hover:hover {
            border: 1px dashed var(--accent-primary);
            color: var(--accent-primary) !important;
        }
        .cursor-pointer {
            cursor: pointer;
        }
        .ls-1 { letter-spacing: 1px; }
        .x-small { font-size: 10px; }
      `}</style>
    </div>
  );
};

export default BoardDetail;
