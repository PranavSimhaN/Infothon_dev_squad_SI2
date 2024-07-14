import {
  Alert,
  Button,
  Label,
  Spinner,
  TextInput,
  Modal,
  Table,
} from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { RiArrowGoBackFill } from "react-icons/ri";

export default function AdminAddNews() {
  const [formData, setFormData] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [news, setNews] = useState([]);
  const [newsToDelete, setNewsToDelete] = useState(null);
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get("/api/user/getallnews");
        setNews(response.data);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sentence || !formData.link) {
      return dispatch(signInFailure("Please fill all the fields"));
    }
    try {
      dispatch(signInStart());
      const res = await fetch("/api/user/addnews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
      }
      if (res.ok) {
        dispatch(signInSuccess(currentUser));
        navigate("/addnews");
        window.location.reload();
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  const handleDeleteClick = (newsItem) => {
    setNewsToDelete(newsItem);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteNews = async () => {
    try {
      await axios.delete(`/api/user/deletenews/${newsToDelete._id}`);
      setNews((prevNews) => prevNews.filter((n) => n._id !== newsToDelete._id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting news:", error);
    }
  };

  return (
    <div className="pb-20 mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col items-center gap-10">
        <div className="w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">
              <Link to="/dashboard?tab=profile">
                <RiArrowGoBackFill className="inline mr-5 cursor-pointer" />
              </Link>
              Add News
            </h2>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label value="Sentence" />
              <TextInput
                type="text"
                placeholder="Enter news sentence"
                id="sentence"
                onChange={handleChange}
                className="w-full p-2"
              />
            </div>
            <div>
              <Label value="Link" />
              <TextInput
                type="text"
                placeholder="Enter news link"
                id="link"
                onChange={handleChange}
                className="w-full p-2"
              />
            </div>
            <Button
              gradientDuoTone="purpleToPink"
              type="submit"
              className="w-full p-2"
            >
         Add news
            </Button>
          </form>
          {errorMessage && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>

      <div className="overflow-x-auto p-8">
      <Table hoverable>
  <Table.Head>
    <Table.HeadCell>Sentence</Table.HeadCell>
    <Table.HeadCell>Link</Table.HeadCell>
    <Table.HeadCell>
      <span className="sr-only">Delete</span>
    </Table.HeadCell>
  </Table.Head>
  <Table.Body className="divide-y">
    {news.map((newsItem) => (
      newsItem.type === 'news' ? (
        <Table.Row
          key={newsItem._id}
          className="bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
            {newsItem.sentence}
          </Table.Cell>
          <Table.Cell>
            <a
              href={newsItem.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-600 hover:underline dark:text-cyan-500"
            >
              {newsItem.link}
            </a>
          </Table.Cell>
          <Table.Cell>
            <button
              className="font-medium text-red-600 hover:underline dark:text-red-500"
              onClick={() => handleDeleteClick(newsItem)}
            >
              Delete
            </button>
          </Table.Cell>
        </Table.Row>
      ) : null
    ))}
  </Table.Body>
</Table>
      </div>

      <Modal
        show={isDeleteModalOpen}
        size="md"
        onClose={() => setIsDeleteModalOpen(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this news?
            </h3>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={handleDeleteNews}
              >
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setIsDeleteModalOpen(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
