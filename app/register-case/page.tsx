// app/register-cases/page.tsx

"use client";
import { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Heading,
  useToast,
  Select,
  Alert,
  AlertIcon,
  Spinner,
  useBreakpointValue,  // <-- Added for responsiveness
} from "@chakra-ui/react";
import { addCase, isCollectorOrAdmin } from "@/utils/helpers";

export default function RegisterCase() {
  const courtIdRef = useRef<HTMLInputElement>(null);
  const caseDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const caseTypeRef = useRef<HTMLSelectElement>(null);
  const petitionerRef = useRef<HTMLInputElement>(null);
  const respondentRef = useRef<HTMLInputElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const toast = useToast();

  const boxWidth = useBreakpointValue({ base: "90%", md: "700px" });  // Adjusts width based on screen size

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const access = await isCollectorOrAdmin();
        setHasAccess(access);
        setIsLoading(false);
        if (!access) {
          setError("You do not have permission to register a case.");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An unknown error occurred.");
        setIsLoading(false);
      }
    };
    checkAccess();
  }, []);

  const handleAddCase = async () => {
    setIsSubmitting(true);

    try {
      if (
        !courtIdRef.current?.value ||
        !caseDescriptionRef.current?.value ||
        !caseTypeRef.current?.value ||
        !petitionerRef.current?.value ||
        !respondentRef.current?.value ||
        !startDateRef.current?.value ||
        !statusRef.current?.value
      ) {
        toast({
          title: "All fields are required.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsSubmitting(false);
        return;
      }

      const response = await addCase(
        courtIdRef.current.value,
        caseDescriptionRef.current.value,
        caseTypeRef.current.value,
        petitionerRef.current.value,
        respondentRef.current.value,
        startDateRef.current.value,
        statusRef.current.value
      );

      if (response.status) {
        toast({
          title: `Case registered successfully with Case ID: ${response.newCaseId}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        // Reset form fields
        courtIdRef.current.value = "";
        caseDescriptionRef.current.value = "";
        petitionerRef.current.value = "";
        respondentRef.current.value = "";
        startDateRef.current.value = "";
        statusRef.current.value = "";
        caseTypeRef.current.value = "";
      } else {
        toast({
          title: "Failed to register case.",
          description: response.error || "An unknown error occurred.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "An unknown error occurred.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box minH="100vh" display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!hasAccess) {
    return (
      <Box minH="100vh" display="flex" justifyContent="center" alignItems="center">
        <Alert status="error">
          <AlertIcon />
          {error || "You do not have permission to view this page."}
        </Alert>
      </Box>
    );
  }

  return (
    <Box minH="100vh" display="flex" justifyContent="center" alignItems="center" py={{ base: 4, md: 10 }} px={4}>
      <Box maxW={boxWidth} w="100%" p={{ base: 4, md: 6 }} borderRadius="lg" boxShadow="md" bg="white">
        <Heading as="h1" size="lg" mb={6} textAlign="center">
          Register Cases
        </Heading>
        <FormControl id="courtId" mb={4} isRequired>
          <FormLabel>Court ID</FormLabel>
          <Input placeholder="Enter court ID" ref={courtIdRef} />
        </FormControl>

        <FormControl id="caseDescription" mb={4} isRequired>
          <FormLabel>Case Description</FormLabel>
          <Textarea placeholder="Enter case description" ref={caseDescriptionRef} />
        </FormControl>

        <FormControl id="caseType" mb={4} isRequired>
          <FormLabel>Case Type</FormLabel>
          <Select placeholder="Select case type" ref={caseTypeRef}>
            <option value="Civil">Civil</option>
            <option value="Criminal">Criminal</option>
            <option value="Family">Family</option>
          </Select>
        </FormControl>

        <FormControl id="petitioner" mb={4} isRequired>
          <FormLabel>Petitioner</FormLabel>
          <Input placeholder="Enter petitioner name" ref={petitionerRef} />
        </FormControl>

        <FormControl id="respondent" mb={4} isRequired>
          <FormLabel>Respondent</FormLabel>
          <Input placeholder="Enter respondent name" ref={respondentRef} />
        </FormControl>

        <FormControl id="startDateTime" mb={4} isRequired>
          <FormLabel>Start Date</FormLabel>
          <Input type="date" ref={startDateRef} />
        </FormControl>

        <FormControl id="status" mb={6} isRequired>
          <FormLabel>Status</FormLabel>
          <Select placeholder="Select status" ref={statusRef}>
            <option value="Open">Open</option>
            <option value="Under Investigation">Under Investigation</option>
            <option value="Closed">Closed</option>
          </Select>
        </FormControl>

        <Button colorScheme="teal" isLoading={isSubmitting} onClick={handleAddCase} width="full">
          Register Case
        </Button>
      </Box>
    </Box>
  );
}
