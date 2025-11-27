<?php

namespace App\Controller;

use App\Entity\Task;
use App\Repository\TaskRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/tasks')]
class TaskController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private TaskRepository $taskRepository,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('', name: 'task_list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $filter = $request->query->get('filter', 'all');

        $tasks = match($filter) {
            'active' => $this->taskRepository->findActive(),
            'completed' => $this->taskRepository->findCompleted(),
            default => $this->taskRepository->findAll()
        };

        return $this->json($tasks, Response::HTTP_OK, [], ['groups' => 'task:read']);
    }

    #[Route('', name: 'task_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['title']) || empty(trim($data['title']))) {
            return $this->json([
                'error' => 'Le titre est requis'
            ], Response::HTTP_BAD_REQUEST);
        }

        $task = new Task();
        $task->setTitle($data['title']);
        $task->setDescription($data['description'] ?? null);
        $task->setCompleted(false);

        $errors = $this->validator->validate($task);
        if (count($errors) > 0) {
            return $this->json([
                'error' => 'Données invalides',
                'details' => (string) $errors
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->persist($task);
        $this->entityManager->flush();

        return $this->json($task, Response::HTTP_CREATED, [], ['groups' => 'task:read']);
    }

    #[Route('/{id}', name: 'task_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $task = $this->taskRepository->find($id);

        if (!$task) {
            return $this->json([
                'error' => 'Tâche non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        return $this->json($task, Response::HTTP_OK, [], ['groups' => 'task:read']);
    }

    #[Route('/{id}', name: 'task_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $task = $this->taskRepository->find($id);

        if (!$task) {
            return $this->json([
                'error' => 'Tâche non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) {
            $task->setTitle($data['title']);
        }

        if (isset($data['description'])) {
            $task->setDescription($data['description']);
        }

        if (isset($data['completed'])) {
            $task->setCompleted($data['completed']);
        }

        $errors = $this->validator->validate($task);
        if (count($errors) > 0) {
            return $this->json([
                'error' => 'Données invalides',
                'details' => (string) $errors
            ], Response::HTTP_BAD_REQUEST);
        }

        $this->entityManager->flush();

        return $this->json($task, Response::HTTP_OK, [], ['groups' => 'task:read']);
    }

    #[Route('/{id}/toggle', name: 'task_toggle', methods: ['PATCH'])]
    public function toggle(int $id): JsonResponse
    {
        $task = $this->taskRepository->find($id);

        if (!$task) {
            return $this->json([
                'error' => 'Tâche non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        $task->setCompleted(!$task->isCompleted());
        $this->entityManager->flush();

        return $this->json($task, Response::HTTP_OK, [], ['groups' => 'task:read']);
    }

    #[Route('/{id}', name: 'task_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $task = $this->taskRepository->find($id);

        if (!$task) {
            return $this->json([
                'error' => 'Tâche non trouvée'
            ], Response::HTTP_NOT_FOUND);
        }

        $this->entityManager->remove($task);
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Tâche supprimée avec succès'
        ], Response::HTTP_OK);
    }

    #[Route('/stats', name: 'task_stats', methods: ['GET'])]
    public function stats(): JsonResponse
    {
        $total = $this->taskRepository->count([]);
        $active = $this->taskRepository->countActive();
        $completed = $total - $active;

        return $this->json([
            'total' => $total,
            'active' => $active,
            'completed' => $completed
        ]);
    }

    #[Route('/completed', name: 'task_clear_completed', methods: ['DELETE'])]
    public function clearCompleted(): JsonResponse
    {
        $count = $this->taskRepository->deleteCompleted();

        return $this->json([
            'message' => "$count tâche(s) supprimée(s)"
        ], Response::HTTP_OK);
    }
}