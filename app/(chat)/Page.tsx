import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ListRenderItem,
  FlatList,
  Keyboard,
} from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { TextInput } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./[chatid]";

export const Page = () => {
  const { chatid } = useLocalSearchParams();

  const [user, setUser] = React.useState<string | null>(null);
  const convex = useConvex();
  const navigation = useNavigation();
  const [newMessage, setNewMessage] = React.useState("");
  const addMessage = useMutation(api.messages.sendMessage);
  const messages =
    useQuery(api.messages.get, { chatId: chatid as Id<"groups"> }) || [];
  const listRef = React.useRef<FlatList>(null);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  useEffect(() => {
    const loadGroup = async () => {
      const groupInfo = await convex.query(api.groups.getGroup, {
        id: chatid as Id<"groups">,
      });
      navigation.setOptions({ headerTitle: groupInfo?.name });
    };
    loadGroup();
  }, [chatid]);

  useEffect(() => {
    const loadUser = async () => {
      const user = await AsyncStorage.getItem("user");

      setUser(user);
    };
    loadUser();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 300);
  }, [messages]);

  const handleSendMessage = async () => {
    Keyboard.dismiss();
    addMessage({
      group_id: chatid as Id<"groups">,
      content: newMessage,
      user: user || "Anon",
    });
    setNewMessage("");
  };
  // const insets = useSafeAreaInsets();
  const renderMessage: ListRenderItem<Doc<"messages">> = ({ item }) => {
    const isUserMessage = item.user === user;

    return (
      <View
        style={[
          styles.messageContainer,
          isUserMessage
            ? styles.userMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        {item.content !== "" && (
          <Text
            style={[
              styles.messageText,
              isUserMessage ? styles.userMessageText : null,
            ]}
          >
            {item.content}
          </Text>
        )}
        <Text style={styles.timestamp}>
          {new Date(item._creationTime).toLocaleTimeString()} - {item.user}
        </Text>
      </View>
    );
  };
  const captureImage = async () => {};
  return (
    <View
      style={{
        // paddingTop: insets.top,
        flex: 1,
        backgroundColor: "#fff",
      }}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        {/* TODO: There will be dragons */}
        <FlatList
          ref={listRef}
          ListFooterComponent={<View style={{ padding: 10 }}></View>}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id.toString()}
        />
        {/* Bottom inout */}
        <View style={styles.inputContainer}>
          <Image />
          <View style={{ flexDirection: "row" }}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type your message"
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Ionicons name="add" style={styles.sendButtonText} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Ionicons name="send-outline" style={styles.sendButtonText} />
            </TouchableOpacity>
            I
          </View>
        </View>
        {/* <Text>Page</Text>
            <Text>{chatid}</Text> */}
      </KeyboardAvoidingView>
    </View>
  );
};
