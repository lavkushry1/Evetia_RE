import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { toast } from 'sonner';
import apiService from '@/services/api';
import { format } from 'date-fns';
import { Search, Filter, CheckCircle, XCircle, Clock, Eye, MessageSquare, RefreshCw } from 'lucide-react';
import { Request } from '../types/api';

// Mock data for requests
const mockRequests = [
  {
    id: 'REQ001',
    userId: 'USER001',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    requestType: 'REFUND',
    status: 'PENDING',
    description: 'Requesting refund for cancelled event',
    createdAt: new Date('2023-04-15T10:30:00'),
    updatedAt: new Date('2023-04-15T10:30:00'),
    eventId: 'EVT001',
    eventName: 'IPL: MI vs CSK',
    bookingId: 'BK001',
    amount: 2500,
    paymentStatus: 'COMPLETED',
    paymentMethod: 'UPI',
    paymentId: 'PAY123456',
    paymentDate: '2023-04-10T14:30:00',
    refundStatus: 'PENDING',
  },
  {
    id: 'REQ002',
    userId: 'USER002',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@example.com',
    requestType: 'TICKET_CHANGE',
    status: 'APPROVED',
    description: 'Need to change ticket date from 15th to 16th',
    createdAt: new Date('2023-04-14T15:45:00'),
    updatedAt: new Date('2023-04-14T16:20:00'),
    eventId: 'EVT002',
    eventName: 'IPL: RCB vs KKR',
    bookingId: 'BK002',
    amount: 1800,
    paymentStatus: 'COMPLETED',
    paymentMethod: 'CREDIT_CARD',
    paymentId: 'PAY789012',
    paymentDate: '2023-04-12T09:15:00',
  },
  {
    id: 'REQ003',
    userId: 'USER003',
    userName: 'Robert Johnson',
    userEmail: 'robert.johnson@example.com',
    requestType: 'REFUND',
    status: 'REJECTED',
    description: 'Requesting refund due to personal emergency',
    createdAt: new Date('2023-04-13T09:15:00'),
    updatedAt: new Date('2023-04-13T11:30:00'),
    eventId: 'EVT003',
    eventName: 'Music Festival',
    bookingId: 'BK003',
    amount: 3500,
  },
  {
    id: 'REQ004',
    userId: 'USER004',
    userName: 'Emily Davis',
    userEmail: 'emily.davis@example.com',
    requestType: 'TICKET_CHANGE',
    status: 'PENDING',
    description: 'Need to change ticket category from VIP to Premium',
    createdAt: new Date('2023-04-12T14:20:00'),
    updatedAt: new Date('2023-04-12T14:20:00'),
    eventId: 'EVT004',
    eventName: 'Comedy Night',
    bookingId: 'BK004',
    amount: 1200,
  },
  {
    id: 'REQ005',
    userId: 'USER005',
    userName: 'Michael Wilson',
    userEmail: 'michael.wilson@example.com',
    requestType: 'REFUND',
    status: 'PENDING',
    description: 'Requesting refund as event was rescheduled',
    createdAt: new Date('2023-04-11T11:10:00'),
    updatedAt: new Date('2023-04-11T11:10:00'),
    eventId: 'EVT005',
    eventName: 'Tech Conference',
    bookingId: 'BK005',
    amount: 5000,
  },
];

// Request types
const requestTypes = [
  { value: 'ALL', label: 'All Requests' },
  { value: 'REFUND', label: 'Refund' },
  { value: 'TICKET_CHANGE', label: 'Ticket Change' },
  { value: 'SUPPORT', label: 'Support' },
];

// Status options
const statusOptions = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

// Pick Schema
interface Pick {
  id: string;
  userId: string;
  eventId: string;
  selectedTeamId: string; // The team the user thinks will win
  points: number; // Points earned if correct
  status: 'PENDING' | 'CORRECT' | 'INCORRECT' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
  submittedAt: Date; // When the user submitted their pick
  resultProcessedAt?: Date; // When the result was processed
}

// Event Schema (extended)
interface Event {
  // ... existing fields
  teams: {
    id: string;
    name: string;
    logo: string;
  }[];
  pickDeadline: Date; // Deadline for submitting picks
  resultAnnouncedAt?: Date; // When the result was announced
  winningTeamId?: string; // The team that won
}

const AdminRequestManagement = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [responseMessage, setResponseMessage] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentStatus: 'PENDING' as 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED',
    paymentMethod: '',
    paymentId: '',
    paymentDate: '',
  });
  const [refundData, setRefundData] = useState({
    refundStatus: 'PENDING' as 'PENDING' | 'COMPLETED' | 'FAILED',
    refundId: '',
    refundDate: '',
    refundAmount: 0,
  });

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getRequests({
        type: selectedType,
        status: selectedStatus,
        search: searchTerm,
        page: 1,
        limit: 10
      });
      setRequests(response.requests);
      setFilteredRequests(response.requests);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [selectedType, selectedStatus]);

  // Filter requests based on search term
  useEffect(() => {
    const filtered = requests.filter((request) =>
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.eventName && request.eventName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredRequests(filtered);
  }, [requests, searchTerm]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle type filter change
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
  };

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  // Handle view request details
  const handleViewRequest = (request: Request) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  // Handle approve request
  const handleApproveRequest = (request: Request) => {
    setSelectedRequest(request);
    setActionType("approve");
    setIsActionDialogOpen(true);
  };

  // Handle reject request
  const handleRejectRequest = (request: Request) => {
    setSelectedRequest(request);
    setActionType("reject");
    setIsActionDialogOpen(true);
  };

  // Handle submit action
  const handleSubmitAction = async () => {
    if (!selectedRequest) return;

    try {
      const response = actionType === "approve"
        ? await apiService.approveRequest(selectedRequest.id, responseMessage)
        : await apiService.rejectRequest(selectedRequest.id, responseMessage);

      if (response.success) {
        toast.success(`Request ${actionType}d successfully`);
        setIsActionDialogOpen(false);
        fetchRequests();
      } else {
        toast.error(`Failed to ${actionType} request`);
      }
    } catch (error) {
      toast.error(`An error occurred while ${actionType}ing the request`);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    if (!selectedRequest) return;

    try {
      setIsLoading(true);
      const response = await apiService.updateRequestPaymentStatus(selectedRequest.id, paymentData);
      
      if (response.success) {
        toast.success('Payment status updated successfully');
        setIsPaymentDialogOpen(false);
        fetchRequests();
      } else {
        toast.error('Failed to update payment status');
      }
    } catch (error) {
      toast.error('An error occurred while updating payment status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRefundStatus = async () => {
    if (!selectedRequest) return;

    try {
      setIsLoading(true);
      const response = await apiService.updateRequestRefundStatus(selectedRequest.id, refundData);
      
      if (response.success) {
        toast.success('Refund status updated successfully');
        setIsRefundDialogOpen(false);
        fetchRequests();
      } else {
        toast.error('Failed to update refund status');
      }
    } catch (error) {
      toast.error('An error occurred while updating refund status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPaymentDialog = (request: Request) => {
    setSelectedRequest(request);
    setPaymentData({
      paymentStatus: request.paymentStatus || 'PENDING',
      paymentMethod: request.paymentMethod || '',
      paymentId: request.paymentId || '',
      paymentDate: request.paymentDate || '',
    });
    setIsPaymentDialogOpen(true);
  };

  const handleOpenRefundDialog = (request: Request) => {
    setSelectedRequest(request);
    setRefundData({
      refundStatus: request.refundStatus || 'PENDING',
      refundId: request.refundId || '',
      refundDate: request.refundDate || '',
      refundAmount: request.refundAmount || request.amount || 0,
    });
    setIsRefundDialogOpen(true);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  // Get request type badge
  const getRequestTypeBadge = (type: string) => {
    const variants = {
      refund: "bg-blue-100 text-blue-800",
      "ticket-change": "bg-purple-100 text-purple-800",
      "other": "bg-gray-100 text-gray-800",
    };
    return <Badge className={variants[type as keyof typeof variants]}>{type}</Badge>;
  };

  const getPaymentStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">Not Set</Badge>;
    
    const variants = {
      PENDING: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      REFUNDED: "bg-blue-100 text-blue-800",
    };
    
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getRefundStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">Not Set</Badge>;
    
    const variants = {
      PENDING: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
    };
    
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-grow bg-gray-50 pt-16 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Request Management</h1>
              <p className="text-gray-600 mt-1">Manage and respond to user requests</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <AnimatedButton size="sm" variant="outline" onClick={fetchRequests} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Data
                  </>
                )}
              </AnimatedButton>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Request Filters</CardTitle>
              <CardDescription>Filter requests by type, status, or search term</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by ID, name, email, or event"
                    className="pl-10"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                <Select value={selectedType} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Request Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requests</CardTitle>
              <CardDescription>
                Showing {filteredRequests.length} of {requests.length} requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Refund</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          No requests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{request.userName}</div>
                              <div className="text-sm text-gray-500">{request.userEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getRequestTypeBadge(request.requestType)}</TableCell>
                          <TableCell>
                            {request.eventName ? (
                              <div>
                                <div className="font-medium">{request.eventName}</div>
                                <div className="text-sm text-gray-500">ID: {request.eventId}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {request.amount ? (
                              <span className="font-medium">₹{request.amount.toLocaleString()}</span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getPaymentStatusBadge(request.paymentStatus)}
                              {request.paymentStatus && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 text-xs"
                                  onClick={() => handleOpenPaymentDialog(request)}
                                >
                                  Update
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getRefundStatusBadge(request.refundStatus)}
                              {request.paymentStatus === 'COMPLETED' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 text-xs"
                                  onClick={() => handleOpenRefundDialog(request)}
                                >
                                  Update
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{format(new Date(request.createdAt), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewRequest(request)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {request.status === 'PENDING' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-green-600 hover:text-green-700"
                                    onClick={() => handleApproveRequest(request)}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => handleRejectRequest(request)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      {/* View Request Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              View details of request {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Request ID</h3>
                  <p>{selectedRequest.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p>{getStatusBadge(selectedRequest.status)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Request Type</h3>
                  <p>{getRequestTypeBadge(selectedRequest.requestType)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                  <p>{selectedRequest.amount ? `₹${selectedRequest.amount.toLocaleString()}` : 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                  <p>{format(new Date(selectedRequest.createdAt), 'MMM d, yyyy HH:mm')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Updated At</h3>
                  <p>{format(new Date(selectedRequest.updatedAt), 'MMM d, yyyy HH:mm')}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">User Information</h3>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p><span className="font-medium">Name:</span> {selectedRequest.userName}</p>
                  <p><span className="font-medium">Email:</span> {selectedRequest.userEmail}</p>
                  <p><span className="font-medium">User ID:</span> {selectedRequest.userId}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Event Information</h3>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p><span className="font-medium">Event:</span> {selectedRequest.eventName || 'N/A'}</p>
                  <p><span className="font-medium">Event ID:</span> {selectedRequest.eventId || 'N/A'}</p>
                  <p><span className="font-medium">Booking ID:</span> {selectedRequest.bookingId || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p>{selectedRequest.description}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Payment Information</h3>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p><span className="font-medium">Payment Status:</span> {getPaymentStatusBadge(selectedRequest.paymentStatus)}</p>
                  <p><span className="font-medium">Payment Method:</span> {selectedRequest.paymentMethod || 'N/A'}</p>
                  <p><span className="font-medium">Payment ID:</span> {selectedRequest.paymentId || 'N/A'}</p>
                  <p><span className="font-medium">Payment Date:</span> {selectedRequest.paymentDate ? format(new Date(selectedRequest.paymentDate), 'MMM d, yyyy HH:mm') : 'N/A'}</p>
                </div>
              </div>
              
              {selectedRequest.paymentStatus === 'COMPLETED' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Refund Information</h3>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p><span className="font-medium">Refund Status:</span> {getRefundStatusBadge(selectedRequest.refundStatus)}</p>
                    <p><span className="font-medium">Refund ID:</span> {selectedRequest.refundId || 'N/A'}</p>
                    <p><span className="font-medium">Refund Date:</span> {selectedRequest.refundDate ? format(new Date(selectedRequest.refundDate), 'MMM d, yyyy HH:mm') : 'N/A'}</p>
                    <p><span className="font-medium">Refund Amount:</span> {selectedRequest.refundAmount ? `₹${selectedRequest.refundAmount.toLocaleString()}` : 'N/A'}</p>
                  </div>
                </div>
              )}
              
              {selectedRequest.responseMessage && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Response Message</h3>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p>{selectedRequest.responseMessage}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Request" : "Reject Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Are you sure you want to approve this request?"
                : "Are you sure you want to reject this request?"}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Response Message</h3>
                <Textarea
                  placeholder={`Enter your ${actionType} message...`}
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setIsActionDialogOpen(false)}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </>
              )}
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSubmitAction}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {actionType === "approve" ? "Approve" : "Reject"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Status Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Update payment status for request {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Payment Status</label>
                <Select 
                  value={paymentData.paymentStatus} 
                  onValueChange={(value: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED') => 
                    setPaymentData({...paymentData, paymentStatus: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Payment Method</label>
                <Input 
                  value={paymentData.paymentMethod} 
                  onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                  placeholder="UPI, Credit Card, etc."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Payment ID</label>
                <Input 
                  value={paymentData.paymentId} 
                  onChange={(e) => setPaymentData({...paymentData, paymentId: e.target.value})}
                  placeholder="Payment transaction ID"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Payment Date</label>
                <Input 
                  type="datetime-local" 
                  value={paymentData.paymentDate ? new Date(paymentData.paymentDate).toISOString().slice(0, 16) : ''} 
                  onChange={(e) => setPaymentData({...paymentData, paymentDate: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePaymentStatus} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Payment Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Refund Status Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Refund Status</DialogTitle>
            <DialogDescription>
              Update refund status for request {selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Refund Status</label>
                <Select 
                  value={refundData.refundStatus} 
                  onValueChange={(value: 'PENDING' | 'COMPLETED' | 'FAILED') => 
                    setRefundData({...refundData, refundStatus: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Refund ID</label>
                <Input 
                  value={refundData.refundId} 
                  onChange={(e) => setRefundData({...refundData, refundId: e.target.value})}
                  placeholder="Refund transaction ID"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Refund Date</label>
                <Input 
                  type="datetime-local" 
                  value={refundData.refundDate ? new Date(refundData.refundDate).toISOString().slice(0, 16) : ''} 
                  onChange={(e) => setRefundData({...refundData, refundDate: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Refund Amount</label>
                <Input 
                  type="number" 
                  value={refundData.refundAmount} 
                  onChange={(e) => setRefundData({...refundData, refundAmount: parseFloat(e.target.value)})}
                  placeholder="Amount to refund"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRefundStatus} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Refund Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRequestManagement; 